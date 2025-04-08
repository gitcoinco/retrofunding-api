import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import type { ProjectMetricsSnapshot } from './types';

// Read and parse the CSV file
const csvFilePath = path.join(__dirname, 'GG33_RETROFUNDING.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
const { data: records } = Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
});

// Create the mapping of applicationId to metrics
const applicationMetricsMap: Record<
  string,
  Partial<ProjectMetricsSnapshot['value']>
> = {};

// Process each record
records.forEach((record: Record<string, string>) => {
  const applicationId = record.id;

  // Create metrics object with the relevant fields
  const metrics: Partial<ProjectMetricsSnapshot['value']> = {
    gmv_growth: parseFloat(
      record.gmv_growth.replace('$', '').replace(',', '').replace(' ', '')
    ),
    unique_donor_growth: parseFloat(record.unique_donor_growth),
    donor_retention_rate: parseFloat(record.donor_retention_rate),
    developer_retention_rate: parseFloat(record.developer_retention_rate),
    scaling_community_rounds: parseFloat(record.scaling_community_rounds),
    current_active_developers: parseFloat(record.current_active_developers),
    network_contribution_score: parseFloat(record.network_contribution_score),
    contributor_onboarding_rate: parseFloat(record.contributor_onboarding_rate),
  };

  // Add to the map
  applicationMetricsMap[applicationId] = metrics;
});

// Save the JSON to a file
const jsonFilePath = path.join(__dirname, 'metrics.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(applicationMetricsMap, null, 2));

console.log(
  'Metrics JSON file has been generated successfully at:',
  jsonFilePath
);
