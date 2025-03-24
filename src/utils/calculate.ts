import { EligibilityType } from '@/entity/EligibilityCriteria';
import { type Vote } from '@/entity/Vote';
import { ActionNotAllowedError, NotFoundError } from '@/errors';
import { indexerClient, Status } from '@/ext/indexer';
import eligibilityCriteriaService from '@/service/EligibilityCriteriaService';
import metricService from '@/service/MetricService';
import poolService from '@/service/PoolService';
import voteService from '@/service/VoteService';
import { isPoolFinalised } from '@/utils';
import { getApplicationMetrics } from '@/utils/applications';
import { type PreparedCalculationData } from '@/utils/types';
import { isAddress } from 'viem';
import Decimal from 'decimal.js';

// Configure Decimal.js for maximum precision
Decimal.set({
  precision: 64, // Precision for financial calculations
  rounding: Decimal.ROUND_DOWN, // Better for financial calculations (prevents overshooting)
});

export interface Distribution {
  alloApplicationId: string;
  distributionPercentage: Decimal;
}

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
): Decimal => {
  let normalizedScore = new Decimal(rawScore).dividedBy(maxValue);
  if (!isIncreasing) {
    normalizedScore = new Decimal(1).minus(normalizedScore);
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

  const eligibilityCriteria =
    await eligibilityCriteriaService.getEligibilityCriteriaByChainIdAndAlloPoolId(
      chainId,
      alloPoolId
    );
  if (eligibilityCriteria?.eligibilityType === EligibilityType.Weighted) {
    const weightedVotes = votes
      .map(vote => ({
        ...vote,
        voterVotingWeight:
          eligibilityCriteria.data.voters[vote?.voter ?? ''] ?? 0,
      }))
      .filter(
        vote =>
          vote.voterVotingWeight > 0 &&
          vote.voterVotingWeight <= 100 &&
          vote.voter !== undefined &&
          isAddress(vote.voter)
      );
    const weightedDistribution = await calculateWeightedDistribution(
      preparedData,
      weightedVotes
    );
    return weightedDistribution;
  }

  const distributions = await calculateDistribution(preparedData, votes);

  return distributions;
};

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

  const appToWeightedScores: Record<string, Decimal> = {};

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

      return ballotItem !== undefined
        ? sum.plus(new Decimal(ballotItem.voteShare))
        : sum;
    }, new Decimal(0));

    // Weighted score for this metric
    const weightedScore = normalizedScore.times(totalVoteShare).dividedBy(100);

    // Add to application's total score
    if (appToWeightedScores[alloApplicationId] === undefined) {
      appToWeightedScores[alloApplicationId] = new Decimal(0);
    }
    appToWeightedScores[alloApplicationId] =
      appToWeightedScores[alloApplicationId].plus(weightedScore);
  }

  // Calculate total weighted scores across all applications
  const totalWeightedScore = Object.values(appToWeightedScores).reduce(
    (sum, score) => sum.plus(score),
    new Decimal(0)
  );

  // Calculate distribution percentages
  const distributions = Object.entries(appToWeightedScores).map(
    ([alloApplicationId, weightedScore]) => {
      const distributionPercentage = totalWeightedScore.isZero()
        ? new Decimal(0)
        : weightedScore.dividedBy(totalWeightedScore).times(100);
      return {
        alloApplicationId,
        distributionPercentage,
      };
    }
  );

  // Sort by distribution percentage descending
  distributions.sort((a, b) =>
    b.distributionPercentage.minus(a.distributionPercentage).toNumber()
  );

  return distributions;
};

interface WeightedVote extends Partial<Vote> {
  voterVotingWeight: number; // 0-100 representing voter's voting power
}

/**
 * Calculates distribution considering voter voting weights
 * @param preparedData The prepared calculation data
 * @param votes Array of votes with voter weights
 * @returns Array of distributions with percentages
 */
export const calculateWeightedDistribution = async (
  preparedData: PreparedCalculationData,
  votes: WeightedVote[]
): Promise<Distribution[]> => {
  const { pool, isIncreasingMap, applicationToMetricsScores, metricsBounds } =
    preparedData;

  // Create a map to store the weighted vote shares for each metric
  const metricWeightedVoteShares: Record<string, Decimal> = {};
  pool.metricIdentifiers.forEach(metric => {
    metricWeightedVoteShares[metric] = new Decimal(0);
  });

  // Step 2: Calculate weighted vote share for each metric
  for (const vote of votes) {
    const voterWeight = new Decimal(vote.voterVotingWeight ?? 0);

    if (vote.ballot === undefined) {
      continue;
    }

    for (const ballotItem of vote.ballot) {
      const metricId = ballotItem.metricIdentifier;
      const voteShare = new Decimal(ballotItem.voteShare ?? 0);

      // Weight this vote share by the voter's voting power
      const weightedShare = voteShare.times(voterWeight).dividedBy(100);
      metricWeightedVoteShares[metricId] =
        metricWeightedVoteShares[metricId].plus(weightedShare);
    }
  }

  // Step 3: Normalize the weighted vote shares to ensure they sum to 100
  const totalWeightedShares = Object.values(metricWeightedVoteShares).reduce(
    (sum, share) => sum.plus(share),
    new Decimal(0)
  );
  const normalizedMetricShares: Record<string, Decimal> = {};

  for (const [metricId, weightedShare] of Object.entries(
    metricWeightedVoteShares
  )) {
    normalizedMetricShares[metricId] = totalWeightedShares.isZero()
      ? new Decimal(100).dividedBy(pool.metricIdentifiers.length)
      : weightedShare.dividedBy(totalWeightedShares).times(100);
  }

  // Step 4: Calculate weighted scores for each application
  const appToWeightedScores: Record<string, Decimal> = {};

  for (const metricScore of applicationToMetricsScores) {
    const {
      alloApplicationId,
      metricIdentifier,
      metricScore: rawScore,
    } = metricScore;

    // Get metric details from the pool
    if (!pool.metricIdentifiers.includes(metricIdentifier)) {
      throw new Error(`Metric "${metricIdentifier}" not found in pool`);
    }

    const { maxValue } = metricsBounds[metricIdentifier];
    const isIncreasing = isIncreasingMap[metricIdentifier] as boolean;
    const normalizedScore = normalizeScore(rawScore, maxValue, isIncreasing);
    // Get the normalized vote share for this metric
    const metricShare =
      normalizedMetricShares[metricIdentifier] ?? new Decimal(0);

    // Weighted score for this application on this metric
    const weightedScore = normalizedScore.times(metricShare).dividedBy(100);
    // Add to application's total score
    if (appToWeightedScores[alloApplicationId] === undefined) {
      appToWeightedScores[alloApplicationId] = new Decimal(0);
    }
    appToWeightedScores[alloApplicationId] =
      appToWeightedScores[alloApplicationId].plus(weightedScore);
  }

  // Step 5: Calculate total weighted scores across all applications
  const totalWeightedScore = Object.values(appToWeightedScores).reduce(
    (sum, score) => sum.plus(score),
    new Decimal(0)
  );

  // Step 6: Calculate distribution percentages
  const distributions = Object.entries(appToWeightedScores).map(
    ([alloApplicationId, weightedScore]) => {
      const distributionPercentage = totalWeightedScore.isZero()
        ? new Decimal(0)
        : weightedScore.dividedBy(totalWeightedScore).times(100);

      return {
        alloApplicationId,
        distributionPercentage,
      };
    }
  );

  // Sort by distribution percentage descending
  distributions.sort((a, b) =>
    b.distributionPercentage.minus(a.distributionPercentage).toNumber()
  );
  return distributions;
};
