import { type Distribution } from '@/entity/Pool';
import { type Vote } from '@/entity/Vote';
import { ActionNotAllowedError, NotFoundError } from '@/errors';
import { indexerClient, Status } from '@/ext/indexer';
import metricService from '@/service/MetricService';
import poolService from '@/service/PoolService';

interface MetricFetcherResponse {
  alloApplicationId: string;
  metricIdentifier: string;
  metricScore: number;
}

// Hardcoded votes for testing purposes
const getHardcodedVotes = (): Array<Partial<Vote>> => {
  return [
    {
      ballot: [
        { metricIdentifier: 'twitterAccountAge', voteShare: 50 },
        { metricIdentifier: 'gasFees', voteShare: 30 },
        { metricIdentifier: 'userEngagement', voteShare: 20 },
      ],
    },
    {
      ballot: [
        { metricIdentifier: 'twitterAccountAge', voteShare: 40 },
        { metricIdentifier: 'gasFees', voteShare: 50 },
        { metricIdentifier: 'userEngagement', voteShare: 10 },
      ],
    },
    {
      ballot: [
        { metricIdentifier: 'twitterAccountAge', voteShare: 60 },
        { metricIdentifier: 'gasFees', voteShare: 20 },
        { metricIdentifier: 'userEngagement', voteShare: 20 },
      ],
    },
    {
      ballot: [
        { metricIdentifier: 'twitterAccountAge', voteShare: 30 },
        { metricIdentifier: 'gasFees', voteShare: 60 },
        { metricIdentifier: 'userEngagement', voteShare: 10 },
      ],
    },
    {
      ballot: [
        { metricIdentifier: 'twitterAccountAge', voteShare: 20 },
        { metricIdentifier: 'gasFees', voteShare: 30 },
        { metricIdentifier: 'userEngagement', voteShare: 50 },
      ],
    },
  ];
};

const getApprovedAlloApplicationIds = async (
  alloPoolId: string,
  chainId: number
): Promise<[boolean, string[]]> => {
  const indexerPoolData = await indexerClient.getRoundWithApplications({
    chainId,
    roundId: alloPoolId,
  });

  // TODO: Implement this from indexer
  const isFinalised = false;

  return [
    isFinalised,
    indexerPoolData?.applications
      .filter(application => application.status === Status.APPROVED)
      .map(application => application.id) ?? [],
  ];
};

// TODO: Implement the gr8LucasMetricFetcher function to fetch metrics from the external endpoint
const gr8LucasMetricFetcher = async (
  alloPoolId: string,
  chainId: number
): Promise<MetricFetcherResponse[]> => {
  // Hardcoded object for now
  return [
    {
      alloApplicationId: '1',
      metricIdentifier: 'twitterAccountAge',
      metricScore: 2,
    },
    { alloApplicationId: '1', metricIdentifier: 'gasFees', metricScore: 30 },
    {
      alloApplicationId: '1',
      metricIdentifier: 'userEngagement',
      metricScore: 0.5,
    },
    {
      alloApplicationId: '2',
      metricIdentifier: 'twitterAccountAge',
      metricScore: 1,
    },
    { alloApplicationId: '2', metricIdentifier: 'gasFees', metricScore: 20 },
    {
      alloApplicationId: '2',
      metricIdentifier: 'userEngagement',
      metricScore: 0.7,
    },
    {
      alloApplicationId: '2',
      metricIdentifier: 'twitterAccountAge',
      metricScore: 3,
    },
    { alloApplicationId: '3', metricIdentifier: 'gasFees', metricScore: 40 },
    {
      alloApplicationId: '3',
      metricIdentifier: 'userEngagement',
      metricScore: 0.4,
    },
    {
      alloApplicationId: '4',
      metricIdentifier: 'twitterAccountAge',
      metricScore: 0.5,
    },
    { alloApplicationId: '4', metricIdentifier: 'gasFees', metricScore: 10 },
    {
      alloApplicationId: '4',
      metricIdentifier: 'userEngagement',
      metricScore: 0.6,
    },
  ];
};

const fetchVotes = async (
  chainId: number,
  alloPoolId: string
): Promise<Array<Partial<Vote>>> => {
  // const votes = await voteService.getVotesByChainIdAndAlloPoolId(chainId, alloPoolId);
  const votes = getHardcodedVotes();
  return votes;
};

// Function to determine if a metric is increasing or decreasing
const isMetricIncreasing = (metricIdentifier: string): boolean => {
  const metric = metricService.getEnabledMetricsByIdentifiers([
    metricIdentifier,
  ]);
  if (metric == null) {
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
    const POSITIVE_CONSTANT = 0.1;
    normalizedScore = POSITIVE_CONSTANT + (1 - normalizedScore);
  }
  return normalizedScore;
};

export const calculate = async (
  chainId: number,
  alloPoolId: string,
  unAccountedBallots?: Partial<Vote>
): Promise<Distribution[]> => {
  const pool = await poolService.getPoolByChainIdAndAlloPoolId(
    chainId,
    alloPoolId
  );
  if (pool == null) {
    throw new NotFoundError(`Pool not found`);
  }

  // Fetch votes using the hardcoded function
  const votes = await fetchVotes(chainId, alloPoolId);

  // Add unAccountedBallots to the votes
  if (unAccountedBallots !== undefined) votes.push(unAccountedBallots);

  // Fetch approved allo application ids
  const [isFinalised, approvedAlloApplicationIds] =
    await getApprovedAlloApplicationIds(alloPoolId, chainId);

  if (isFinalised) {
    throw new ActionNotAllowedError('Pool is finalised');
  }

  // Fetch metrics from the external endpoint
  const fetchedApplicaionMetricScores = await gr8LucasMetricFetcher(
    alloPoolId,
    chainId
  );

  // Filter the applicationToMetricsScores array to only include approved applications
  const applicationToMetricsScores = fetchedApplicaionMetricScores.filter(
    metric => approvedAlloApplicationIds.includes(metric.alloApplicationId)
  );

  // Precompute min and max values for each metric
  const metricBounds: Record<string, { minValue: number; maxValue: number }> =
    {};
  applicationToMetricsScores.forEach(({ metricIdentifier, metricScore }) => {
    if (metricBounds[metricIdentifier] == null) {
      metricBounds[metricIdentifier] = {
        minValue: metricScore,
        maxValue: metricScore,
      };
    } else {
      metricBounds[metricIdentifier].minValue = Math.min(
        metricBounds[metricIdentifier].minValue,
        metricScore
      );
      metricBounds[metricIdentifier].maxValue = Math.max(
        metricBounds[metricIdentifier].maxValue,
        metricScore
      );
    }
  });

  // Normalize and calculate weighted scores
  const appToWeightedScores: Record<string, number> = {};

  for (const metricScore of applicationToMetricsScores) {
    const {
      alloApplicationId,
      metricIdentifier,
      metricScore: rawScore,
    } = metricScore;

    // Get metric details from the pool
    if (!pool.metricIdentifiers.includes(metricIdentifier)) {
      throw new NotFoundError(`Metric "${metricIdentifier}" not found in pool`);
    }

    const { maxValue } = metricBounds[metricIdentifier];
    const isIncreasing = isMetricIncreasing(metricIdentifier);
    const normalizedScore = normalizeScore(rawScore, maxValue, isIncreasing);

    // Get vote share for the metric
    const totalVoteShare = votes.reduce((sum, vote) => {
      const ballotItem = vote.ballot?.find(
        item => item.metricIdentifier === metricIdentifier
      );
      return ballotItem != null ? sum + ballotItem.voteShare : sum;
    }, 0);

    // Weighted score for this metric
    const weightedScore = (normalizedScore * totalVoteShare) / 100;

    // Add to application's total score
    if (appToWeightedScores[alloApplicationId] == null) {
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
        distribution_percentage: distributionPercentage,
      };
    }
  );

  // Sort by distribution percentage descending
  distributions.sort(
    (a, b) => b.distribution_percentage - a.distribution_percentage
  );

  return distributions;
};
