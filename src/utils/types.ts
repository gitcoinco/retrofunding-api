export interface ProjectMetricsSnapshot {
  id: string;
  roundId: string;
  projectId: string;
  value: {
    forkCount: string;
    projectId: string;
    starCount: string;
    displayName: string;
    projectName: string;
    developerCount: number;
    lastCommitDate: string;
    firstCommitDate: string;
    repositoryCount: string;
    contributorCount: number;
    lastUpdatedAtDate: string;
    commitCount6Months: number;
    firstCreatedAtDate: string;
    commentCount6Months: number;
    releaseCount6Months: number;
    closedIssueCount6Months: number;
    contributorCount6Months: number;
    openedIssueCount6Months: number;
    newContributorCount6Months: number;
    activeDeveloperCount6Months: number;
    mergedPullRequestCount6Months: number;
    openedPullRequestCount6Months: number;
    timeToMergeDaysAverage6Months: number;
    fulltimeDeveloperAverage6Months: number;
    timeToFirstResponseDaysAverage6Months: number;
  };
  snapshotTime: string;
  createdAt: string;
}

export type SnapshotMetricKeys = keyof ProjectMetricsSnapshot['value'] | string;

export interface MetricFetcherResponse {
  alloApplicationId: string;
  metricIdentifier: string;
  metricScore: number;
}

export interface PreparedCalculationData {
  pool: {
    metricIdentifiers: string[];
  };
  isIncreasingMap: Record<string, boolean>;
  applicationToMetricsScores: MetricFetcherResponse[];
  metricsBounds: MetricBounds;
}

export type MetricBounds = Record<
  string,
  { minValue: number; maxValue: number }
>;
