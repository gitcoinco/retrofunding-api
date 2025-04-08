import {
  type MetricBounds,
  type MetricFetcherResponse,
  type ProjectMetricsSnapshot,
  type SnapshotMetricKeys,
} from '@/utils/types';
import fs from 'fs';
import path from 'path';

const _getApplicationsMetrics = (
  applicationIds: string[]
): Record<string, Partial<ProjectMetricsSnapshot['value']>> => {
  const result: Record<string, Partial<ProjectMetricsSnapshot['value']>> = {};

  // Read the metrics JSON file
  const jsonFilePath = path.join(__dirname, 'metrics.json');
  const applicationMetricsMap: Record<
    string,
    Partial<ProjectMetricsSnapshot['value']>
  > = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

  applicationIds.forEach(id => {
    const metrics = applicationMetricsMap[id];
    if (metrics !== undefined) {
      result[id] = metrics;
    }
  });

  return result;
};

export const getApplicationMetrics = async (
  applicationIds: string[],
  roundId: string,
  roundMetrics: Array<{
    identifier: SnapshotMetricKeys;
    isIncreasing: boolean;
  }>
): Promise<{
  applicationMetrics: MetricFetcherResponse[];
  metricsBounds: MetricBounds;
}> => {
  if (applicationIds.length === 0) {
    return {
      applicationMetrics: [],
      metricsBounds: {},
    };
  }

  const applicationMetricsMap = _getApplicationsMetrics(applicationIds);

  // Track valid values and invalid applications for each metric
  const validMetricValues: Record<string, number[]> = {};
  const invalidApplications: Record<string, string[]> = {};

  // First pass: collect valid values and track invalid applications
  for (const applicationId of applicationIds) {
    const metrics = applicationMetricsMap[applicationId];
    if (metrics === undefined) {
      continue;
    }

    for (const metric of roundMetrics) {
      const metricValue = metrics[metric.identifier];
      if (metricValue === null || metricValue === undefined) {
        (invalidApplications[metric.identifier] ??= []).push(applicationId);
      } else {
        (validMetricValues[metric.identifier] ??= []).push(Number(metricValue));
      }
    }
  }

  // Precompute min and max values for each metric
  const metricsBounds: MetricBounds = {};
  for (const metric of roundMetrics) {
    const values = validMetricValues[metric.identifier];
    if (Array.isArray(values) && values.length > 0) {
      metricsBounds[metric.identifier] = {
        minValue: Math.min(...values),
        maxValue: Math.max(...values),
      };
    }
  }

  // Second pass: create the response with appropriate values
  return {
    applicationMetrics: applicationIds.flatMap(applicationId => {
      const metrics = applicationMetricsMap[applicationId];
      if (typeof metrics !== 'object' || metrics === null) {
        return [];
      }

      return roundMetrics.map(metric => {
        let metricValue = metrics[metric.identifier];
        if (typeof metricValue !== 'number') {
          const bounds = metricsBounds[metric.identifier];
          if (
            bounds !== undefined &&
            typeof bounds.minValue === 'number' &&
            typeof bounds.maxValue === 'number'
          ) {
            metricValue = metric.isIncreasing
              ? bounds.minValue
              : bounds.maxValue;
          }
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
