import { ServerError } from '@/errors';
import { catchError } from '@/utils';
import {
  type MetricBounds,
  type MetricFetcherResponse,
  type ProjectMetricsSnapshot,
  type SnapshotMetricKeys,
} from '@/utils/types';
import { env } from '@/env';

export const applicationsIdToMetricsRegistryId = {
  '0': '2Pi2+vR6tA5ntJH5x8g6/bOrc6pGDMraeNRxWJK27fU=',
  '1': '4juDfq8eT1mY8Mmg2p11BG4MlKIqxxFPVCj9bsvR6Ss=',
  '2': 'c/Fb+vkK+OeHREaBp5vCUL6lXNm1wOB02s7U+Ve5gdE=',
  '3': 'kF+PqUr+BLkmB0T2MpFCjemhL+WmS7ggVJmBWULnbIM=',
  '4': 'MbqGA89EGGqR9NEZUcBKBv0BKHU29TmqvbI2suxj518=',
  '5': '+mENAM3J6TDvyHbcs555E/0HD1s+11nYGpK0kyd+ouE=',
  '6': '+mENAM3J6TDvyHbcs555E/0HD1s+11nYGpK0kyd+ouE=',
  '7': 'P8NO+ILp+KB5nLmDnqZJizv+ooHvKuJVX3qRrQ80xHs=',
  '8': 'vwzM0N8WcT6WGLZaqOGlKKJtihOmTaPLk+NINu50JgY=',
  '9': 'WQZJlExc3O96r6BsnIIUKYRDxhqjta4keHGpWT3k5b0=',
  '10': 'Ze3WplcoRVxM/Fm2/NUE4FNq2sU6Zkl6OOoIY7H/aq4=',
  '11': '2Pi2+vR6tA5ntJH5x8g6/bOrc6pGDMraeNRxWJK27fU=',
  '12': '4juDfq8eT1mY8Mmg2p11BG4MlKIqxxFPVCj9bsvR6Ss=',
  '13': 'c/Fb+vkK+OeHREaBp5vCUL6lXNm1wOB02s7U+Ve5gdE=',
  '14': 'kF+PqUr+BLkmB0T2MpFCjemhL+WmS7ggVJmBWULnbIM=',
  '15': 'MbqGA89EGGqR9NEZUcBKBv0BKHU29TmqvbI2suxj518=',
  '16': '+mENAM3J6TDvyHbcs555E/0HD1s+11nYGpK0kyd+ouE=',
  '17': 'P8NO+ILp+KB5nLmDnqZJizv+ooHvKuJVX3qRrQ80xHs=',
  '18': 'vwzM0N8WcT6WGLZaqOGlKKJtihOmTaPLk+NINu50JgY=',
  '19': 'WQZJlExc3O96r6BsnIIUKYRDxhqjta4keHGpWT3k5b0=',
  '20': 'Ze3WplcoRVxM/Fm2/NUE4FNq2sU6Zkl6OOoIY7H/aq4=',
};

const ROUND_ID = env.ROUND_ID ?? '09445988-cd06-4a90-9c3a-0766650a933f';

const dateValueKeys = [
  'lastCommitDate',
  'firstCommitDate',
  'lastUpdatedAtDate',
  'firstCreatedAtDate',
];

export const getRoundSnapshots = async (
  roundId: string
): Promise<{ snapshots: ProjectMetricsSnapshot[] }> => {
  const resp = await fetch(
    `https://impact-metrics.vercel.app/api/csv/snapshots?roundId=${roundId}`
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
  const snapshots = await getApplicationsLatestSnapshot(
    applicationIds,
    ROUND_ID
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
