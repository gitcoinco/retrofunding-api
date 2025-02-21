import { ServerError } from '@/errors';
import { catchError } from '@/utils';
import {
  type MetricBounds,
  type MetricFetcherResponse,
  type ProjectMetricsSnapshot,
  type SnapshotMetricKeys,
} from '@/utils/types';

export const applicationsIdToMetricsRegistryId = {
  '0': '4juDfq8eT1mY8Mmg2p11BG4MlKIqxxFPVCj9bsvR6Ss=',
  '1': 'WQZJlExc3O96r6BsnIIUKYRDxhqjta4keHGpWT3k5b0=',
  '2': '4juDfq8eT1mY8Mmg2p11BG4MlKIqxxFPVCj9bsvR6Ss=',
  '3': 'WQZJlExc3O96r6BsnIIUKYRDxhqjta4keHGpWT3k5b0=',
  '4': '4juDfq8eT1mY8Mmg2p11BG4MlKIqxxFPVCj9bsvR6Ss=',
  '5': 'WQZJlExc3O96r6BsnIIUKYRDxhqjta4keHGpWT3k5b0=',
  '6': '4juDfq8eT1mY8Mmg2p11BG4MlKIqxxFPVCj9bsvR6Ss=',
  '7': 'WQZJlExc3O96r6BsnIIUKYRDxhqjta4keHGpWT3k5b0=',
};

const hardcodedRoundId = '9921615e-7edd-4569-9b3f-785dcc3aac5e';

const dateValueKeys = [
  'lastCommitDate',
  'firstCommitDate',
  'lastUpdatedAtDate',
  'firstCreatedAtDate',
];

export const getRoundSnapshots = async (
  roundId: string
): Promise<{ snapshots: ProjectMetricsSnapshot[] }> => {
  console.log(roundId);
  const resp = await fetch(
    `https://impact-metrics.vercel.app/api/oso/snapshots?roundId=${roundId}`
  );
  const data = await resp.json();
  return data;
};

export const getApplicationsLatestSnapshot = async (
  applicationIds: string[],
  roundId: string
): Promise<Record<string, ProjectMetricsSnapshot>> => {
  const [error, roundSnapshots] = await catchError(getRoundSnapshots(roundId));
  if (error !== undefined || roundSnapshots === undefined) {
    throw new ServerError(`Error fetching round snapshots`);
  }

  const applicationsLatestSnapshot = applicationIds.map(applicationId => {
    const projectId =
      applicationsIdToMetricsRegistryId[
        applicationId as keyof typeof applicationsIdToMetricsRegistryId
      ];

    // Find all snapshots for this projectId
    const projectSnapshots = roundSnapshots.snapshots.filter(
      snapshot => snapshot.projectId === projectId
    );

    // Get the latest snapshot by sorting by snapshotTime descending
    const latestSnapshot = projectSnapshots.sort(
      (a, b) =>
        new Date(b.snapshotTime).getTime() - new Date(a.snapshotTime).getTime()
    )[0];

    return {
      applicationId,
      snapshot: latestSnapshot,
    };
  });

  const result: Record<string, ProjectMetricsSnapshot> =
    applicationsLatestSnapshot.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.applicationId]: curr.snapshot,
      }),
      {}
    );
  return result;
};

export const getApplicationMetrics = async (
  applicationIds: string[],
  roundId: string,
  metrics: Array<{
    identifier: SnapshotMetricKeys;
    isIncreasing: boolean;
  }>
): Promise<{
  applicationMetrics: MetricFetcherResponse[];
  metricsBounds: MetricBounds;
}> => {
  console.log(roundId);
  const snapshots = await getApplicationsLatestSnapshot(
    applicationIds,
    hardcodedRoundId
  );
  // Track valid values and invalid applications for each metric
  const validMetricValues: Record<string, number[]> = {};
  const invalidApplications: Record<string, string[]> = {};

  // First pass: collect valid values and track invalid applications
  for (const applicationId of applicationIds) {
    const snapshot = snapshots[applicationId];
    for (const metric of metrics) {
      let metricValue = snapshot.value[metric.identifier];

      if (dateValueKeys.includes(metric.identifier)) {
        metricValue = new Date(metricValue as string).getTime();
      }

      if (
        metricValue === null ||
        metricValue === undefined ||
        (dateValueKeys?.includes(metric?.identifier) &&
          isNaN(Number(metricValue)))
      ) {
        (invalidApplications[metric.identifier] ??= []).push(applicationId);
      } else {
        (validMetricValues[metric.identifier] ??= []).push(Number(metricValue));
      }
    }
  }
  // Precompute min and max values for each metric
  const metricsBounds: MetricBounds = {};
  for (const metric of metrics) {
    const values = validMetricValues[metric.identifier];
    metricsBounds[metric.identifier] = {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }

  // Second pass: replace invalid values with the appropriate valid value
  return {
    applicationMetrics: applicationIds.flatMap(applicationId => {
      const snapshot = snapshots[applicationId];
      return metrics.map(metric => {
        let metricValue = snapshot.value[metric.identifier];
        if (dateValueKeys?.includes(metric.identifier)) {
          metricValue = new Date(metricValue as string).getTime();
        }
        if (invalidApplications[metric.identifier]?.includes(applicationId)) {
          // If the metric of this application is invalid, we set it to the minimum or maximum value depending on whether the metric is increasing or decreasing
          // TODO: Either set the worst possible value or return the invalid metricsApplications Map and ignore them in the calculation of the distribution
          const bounds = metricsBounds[metric.identifier];
          metricValue = metric.isIncreasing ? bounds.minValue : bounds.maxValue;
        }

        return {
          alloApplicationId: applicationId,
          metricIdentifier: metric.identifier,
          metricScore: metricValue,
        };
      });
    }),
    metricsBounds,
  };
};
