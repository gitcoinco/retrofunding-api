import { type Distribution } from '@/entity/Pool';
import { type Vote } from '@/entity/Vote';
import { ActionNotAllowedError, NotFoundError } from '@/errors';
import { indexerClient, Status } from '@/ext/indexer';
import metricService from '@/service/MetricService';
import poolService from '@/service/PoolService';
import voteService from '@/service/VoteService';
import { isPoolFinalised } from '@/utils';
import { getApplicationMetrics } from '@/utils/applications';
import { type MetricBounds, type MetricFetcherResponse } from '@/utils/types';
const getApprovedAlloApplicationIds = async (
  alloPoolId: string,
  chainId: number
): Promise<string[]> => {
  const indexerPoolData = await indexerClient.getRoundWithApplications({
    chainId,
    roundId: alloPoolId,
  });

  return (
    indexerPoolData?.applications
      .filter(application => application.status === Status.APPROVED)
      .map(application => application.id) ?? []
  );
};

const fetchVotes = async (
  chainId: number,
  alloPoolId: string
): Promise<Array<Partial<Vote>>> => {
  const votes = await voteService.getVotesByChainIdAndAlloPoolId(
    chainId,
    alloPoolId
  );
  return votes ?? [];
};

// Function to determine if a metric is increasing or decreasing
const isMetricIncreasing = async (
  metricIdentifier: string
): Promise<boolean> => {
  const metric = await metricService.getEnabledMetricsByIdentifiers([
    metricIdentifier,
  ]);
  if (metric === undefined) {
    throw new NotFoundError(`Metric not found`);
  }
  return metric[0].orientation === 'increase';
};

// Function to normalize the score
const normalizeScore = (
  rawScore: number,
  maxValue: number,
  isIncreasing: boolean
): number => {
  let normalizedScore = rawScore / maxValue;
  if (!isIncreasing) {
    normalizedScore = +(1 - normalizedScore);
  }
  return normalizedScore;
};

export const calculate = async (
  chainId: number,
  alloPoolId: string,
  unAccountedBallots?: Partial<Vote>
): Promise<Distribution[]> => {
  const preparedData = await prepareCalculationData(chainId, alloPoolId);

  // Fetch votes using the hardcoded function
  const votes = await fetchVotes(chainId, alloPoolId);

  // Add unAccountedBallots to the votes
  if (unAccountedBallots !== undefined) votes.push(unAccountedBallots);

  if (await isPoolFinalised(alloPoolId, chainId)) {
    throw new ActionNotAllowedError('Pool is finalised');
  }

  const distributions = await calculateDistribution(preparedData, votes);

  return distributions;
};

// Define new types
interface PreparedCalculationData {
  pool: {
    metricIdentifiers: string[];
  };
  isIncreasingMap: Record<string, boolean>;
  applicationToMetricsScores: MetricFetcherResponse[];
  metricsBounds: MetricBounds;
}

// New preparation function with explicit return type
export const prepareCalculationData = async (
  chainId: number,
  alloPoolId: string
): Promise<PreparedCalculationData> => {
  const pool = await poolService.getPoolByChainIdAndAlloPoolId(
    chainId,
    alloPoolId
  );
  if (pool == null) {
    throw new NotFoundError(`Pool not found`);
  }

  const isIncreasingMap: Record<string, boolean> = {};
  for (const metricIdentifier of pool.metricIdentifiers) {
    isIncreasingMap[metricIdentifier] =
      await isMetricIncreasing(metricIdentifier);
  }

  const approvedAlloApplicationIds = await getApprovedAlloApplicationIds(
    alloPoolId,
    chainId
  );

  const { applicationMetrics, metricsBounds } = await getApplicationMetrics(
    approvedAlloApplicationIds,
    alloPoolId,
    pool.metricIdentifiers.map(metricIdentifier => ({
      identifier: metricIdentifier,
      isIncreasing: isIncreasingMap[metricIdentifier],
    }))
  );

  return {
    pool: {
      metricIdentifiers: pool.metricIdentifiers,
    },
    isIncreasingMap,
    applicationToMetricsScores: applicationMetrics,
    metricsBounds,
  };
};

// New calculation function with explicit parameter types
export const calculateDistribution = async (
  preparedData: PreparedCalculationData,
  votes: Array<Partial<Vote>>
): Promise<Distribution[]> => {
  const { pool, isIncreasingMap, applicationToMetricsScores, metricsBounds } =
    preparedData;

  const appToWeightedScores: Record<string, number> = {};

  for (const metricScore of applicationToMetricsScores) {
    const {
      alloApplicationId,
      metricIdentifier,
      // TODO: Check how we could handle wrong application metric scores. Check also ./applications.ts in function getApplicationMetrics
      metricScore: rawScore,
    } = metricScore;

    // Get metric details from the pool
    if (!pool.metricIdentifiers.includes(metricIdentifier)) {
      throw new NotFoundError(`Metric "${metricIdentifier}" not found in pool`);
    }

    const { maxValue } = metricsBounds[metricIdentifier];
    const isIncreasing = isIncreasingMap[metricIdentifier] as boolean;
    const normalizedScore = normalizeScore(rawScore, maxValue, isIncreasing);
    // Get vote share for the metric
    const totalVoteShare = votes.reduce((sum, vote) => {
      const ballotItem = vote.ballot?.find(
        item => item.metricIdentifier === metricIdentifier
      );

      return ballotItem !== undefined ? sum + ballotItem.voteShare : sum;
    }, 0);

    // Weighted score for this metric
    const weightedScore = (normalizedScore * totalVoteShare) / 100;

    // Add to application's total score
    if (appToWeightedScores[alloApplicationId] === undefined) {
      appToWeightedScores[alloApplicationId] = 0;
    }
    appToWeightedScores[alloApplicationId] += weightedScore;
  }

  // Calculate total weighted scores across all applications
  const totalWeightedScore = Object.values(appToWeightedScores).reduce(
    (sum, score) => sum + score,
    0
  );

  // Calculate distribution percentages
  const distributions = Object.entries(appToWeightedScores).map(
    ([alloApplicationId, weightedScore]) => {
      const distributionPercentage =
        totalWeightedScore > 0 ? (weightedScore / totalWeightedScore) * 100 : 0;
      return {
        alloApplicationId,
        distributionPercentage,
      };
    }
  );

  // Sort by distribution percentage descending
  distributions.sort(
    (a, b) => b.distributionPercentage - a.distributionPercentage
  );

  return distributions;
};
