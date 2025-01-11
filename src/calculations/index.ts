import { Metric } from '@/entity/Metric';
import { Vote } from '@/entity/Vote';
import { NotFoundError } from '@/errors';
import poolService from '@/service/PoolService';

// Hardcoded votes for testing purposes
const getHardcodedVotes = (): Partial<Vote>[] => {
  return [
    {
      ballot: [
        { metricName: 'twitterAccountAge', metricId: 1, voteShare: 50 },
        { metricName: 'gasFees', metricId: 2, voteShare: 30 },
        { metricName: 'userEngagement', metricId: 3, voteShare: 20 },
      ],
    },
    {
      ballot: [
        { metricName: 'twitterAccountAge', metricId: 1, voteShare: 40 },
        { metricName: 'gasFees', metricId: 2, voteShare: 50 },
        { metricName: 'userEngagement', metricId: 3, voteShare: 10 },
      ],
    },
    {
      ballot: [
        { metricName: 'twitterAccountAge', metricId: 1, voteShare: 60 },
        { metricName: 'gasFees', metricId: 2, voteShare: 20 },
        { metricName: 'userEngagement', metricId: 3, voteShare: 20 },
      ],
    },
    {
      ballot: [
        { metricName: 'twitterAccountAge', metricId: 1, voteShare: 30 },
        { metricName: 'gasFees', metricId: 2, voteShare: 60 },
        { metricName: 'userEngagement', metricId: 3, voteShare: 10 },
      ],
    },
    {
      ballot: [
        { metricName: 'twitterAccountAge', metricId: 1, voteShare: 20 },
        { metricName: 'gasFees', metricId: 2, voteShare: 30 },
        { metricName: 'userEngagement', metricId: 3, voteShare: 50 },
      ],
    },
  ];
};

// TODO: Implement the gr8LucasMetricFetcher function to fetch metrics from the external endpoint
const gr8LucasMetricFetcher = async (alloPoolId: string, chainId: number) => {
  // Hardcoded object for now
  return [
    {
      alloApplicationId: 'app1',
      metricName: 'twitterAccountAge',
      metricScore: 2,
    },
    { alloApplicationId: 'app1', metricName: 'gasFees', metricScore: 30 },
    {
      alloApplicationId: 'app1',
      metricName: 'userEngagement',
      metricScore: 0.5,
    },
    {
      alloApplicationId: 'app2',
      metricName: 'twitterAccountAge',
      metricScore: 1,
    },
    { alloApplicationId: 'app2', metricName: 'gasFees', metricScore: 20 },
    {
      alloApplicationId: 'app2',
      metricName: 'userEngagement',
      metricScore: 0.7,
    },
    {
      alloApplicationId: 'app3',
      metricName: 'twitterAccountAge',
      metricScore: 3,
    },
    { alloApplicationId: 'app3', metricName: 'gasFees', metricScore: 40 },
    {
      alloApplicationId: 'app3',
      metricName: 'userEngagement',
      metricScore: 0.4,
    },
    {
      alloApplicationId: 'app4',
      metricName: 'twitterAccountAge',
      metricScore: 0.5,
    },
    { alloApplicationId: 'app4', metricName: 'gasFees', metricScore: 10 },
    {
      alloApplicationId: 'app4',
      metricName: 'userEngagement',
      metricScore: 0.6,
    },
    {
      alloApplicationId: 'app5',
      metricName: 'twitterAccountAge',
      metricScore: 4,
    },
    { alloApplicationId: 'app5', metricName: 'gasFees', metricScore: 50 },
    {
      alloApplicationId: 'app5',
      metricName: 'userEngagement',
      metricScore: 0.2,
    },
  ];
};

const fetchVotes = async (chainId: number, alloPoolId: string) => {
  // const votes = await voteService.getVotesByChainIdAndAlloPoolId(chainId, alloPoolId);
  const votes = getHardcodedVotes();
  return votes;
};

// Function to determine if a metric is increasing or decreasing
const isMetricIncreasing = async (metrics: Metric[], metricName: string) => {
  const metric = metrics.find(metric => metric.name === metricName);
  if (metric == null) {
    throw new NotFoundError(`Metric not found`);
  }
  return metric.orientation === 'increase';
};

export const calculateDistributions = async (
  alloPoolId: string,
  chainId: number
) => {
  const pool = await poolService.getPoolByChainIdAndAlloPoolId(
    chainId,
    alloPoolId
  );
  if (pool == null) {
    throw new NotFoundError(`Pool not found`);
  }

  // Fetch votes using the hardcoded function
  const votes = await fetchVotes(chainId, alloPoolId);

  // Fetch metrics from the external endpoint
  const applicationToMetricsScores = await gr8LucasMetricFetcher(
    alloPoolId,
    chainId
  );

  // Precompute min and max values for each metric
  const metricBounds: Record<string, { minValue: number; maxValue: number }> =
    {};
  applicationToMetricsScores.forEach(({ metricName, metricScore }) => {
    if (!metricBounds[metricName]) {
      metricBounds[metricName] = {
        minValue: metricScore,
        maxValue: metricScore,
      };
    } else {
      metricBounds[metricName].minValue = Math.min(
        metricBounds[metricName].minValue,
        metricScore
      );
      metricBounds[metricName].maxValue = Math.max(
        metricBounds[metricName].maxValue,
        metricScore
      );
    }
  });

  // Normalize and calculate weighted scores
  const appToWeightedScores: Record<string, number> = {};

  for (const metricScore of applicationToMetricsScores) {
    const {
      alloApplicationId,
      metricName,
      metricScore: rawScore,
    } = metricScore;

    // Get metric details from the pool
    const metricDetails = pool.metrics.find(
      metric => metric.name === metricName
    );
    if (!metricDetails) {
      throw new NotFoundError(`Metric "${metricName}" not found in pool`);
    }

    const { minValue, maxValue } = metricBounds[metricName];
    const isIncreasing = await isMetricIncreasing(pool.metrics, metricName);

    // Normalize score
    let normalizedScore = rawScore / maxValue;
    if (!isIncreasing) {
      const POSITIVE_CONSTANT = 0.1;
      normalizedScore = POSITIVE_CONSTANT + (1 - normalizedScore);
    }

    // Get vote share for the metric
    const totalVoteShare = votes.reduce((sum, vote) => {
      const ballotItem = vote.ballot?.find(
        item => item.metricName === metricName
      );
      return ballotItem ? sum + ballotItem.voteShare : sum;
    }, 0);

    // Weighted score for this metric
    const weightedScore = (normalizedScore * totalVoteShare) / 100;

    // Add to application's total score
    if (!appToWeightedScores[alloApplicationId]) {
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
