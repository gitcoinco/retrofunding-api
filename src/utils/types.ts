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
    // GMV Growth
    gmv_growth: number;
    // Donor Growth
    unique_donor_growth: number;
    // Donor Retention
    donor_retention_rate: number;
    // Developer Retention (Avg. Dev. Months)
    developer_retention_rate: number;
    // No. of Community Rounds Participated In
    scaling_community_rounds: number;
    // No. of Active Developers
    current_active_developers: number;
    // Avg. No. of Projects Supported Per Donor
    network_contribution_score: number;
    // No. of Contributors Onboarded
    contributor_onboarding_rate: number;
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
