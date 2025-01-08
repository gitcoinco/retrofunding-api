import { type Request, type Response } from 'express';
import metricService from '@/service/MetricService';
import { catchError, validateRequest } from '@/utils';
import { type Metric, Priority } from '@/entity/Metric';
import { BadRequestError, IsNullError } from '@/errors';
import { createLogger } from '@/logger';

const logger = createLogger();

// Function to validate if an object is a Metric
const isMetric = (obj: any): obj is Metric => {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    (obj.priority === Priority.Ascending ||
      obj.priority === Priority.Descending) &&
    typeof obj.active === 'boolean'
  );
};

const isValidMetricsData = (data: any): data is Metric[] => {
  return Array.isArray(data) && data.every(isMetric);
};

export const addMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  const data = req.body;

  // Combined validation to check if req.body is Metric[]
  if (!isValidMetricsData(data)) {
    res.status(400).json({ message: 'Bad Request' });
    throw new BadRequestError('Bad Request');
  }

  const metricsData: Metric[] = data;

  const [error, metrics] = await catchError(
    metricService.saveMetrics(metricsData)
  );

  if (error != null || metrics == null) {
    logger.error(`Failed to save metrics: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error saving metrics', error: error?.message });
    throw new IsNullError('Error saving metrics');
  }

  logger.info('successfully saved metrics', metrics);
  res.status(201).json({ message: 'Metrics saved successfully.' });
};
