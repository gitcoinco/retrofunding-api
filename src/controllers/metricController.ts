import { type Request, type Response } from 'express';
import metricService from '@/service/MetricService';
import { catchError, validateRequest } from '@/utils';
import { type Metric, MetricOrientation } from '@/entity/Metric';
import { BadRequestError, IsNullError } from '@/errors';
import { createLogger } from '@/logger';

const logger = createLogger();

// Function to validate if an object is a Metric
const isMetric = (obj: any): obj is Metric => {
  return (
    typeof obj === 'object' &&
    typeof obj.identifier === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    (obj.orientation === MetricOrientation.Increase ||
      obj.orientation === MetricOrientation.Decrease) &&
    typeof obj.enabled === 'boolean'
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

  // TODO: ensure caller is admin

  const data = req.body as Metric[];

  // Combined validation to check if req.body is Metric[]
  if (!isValidMetricsData(data)) {
    res.status(400).json({ message: 'Bad Request' });
    throw new BadRequestError('Bad Request');
  }

  const metricsData: Metric[] = data;

  const [error] = await catchError(metricService.saveMetrics(metricsData));

  if (error !== undefined) {
    logger.error(`Failed to save metrics: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error saving metrics', error: error?.message });
    throw new IsNullError('Error saving metrics');
  }

  logger.info('successfully saved metrics');
  res.status(201).json({ message: 'Metrics saved successfully.' });
};

export const updateMetric = async (
  req: Request,
  res: Response
): Promise<void> => {
  validateRequest(req, res);

  const identifier = req.params.identifier;
  const metric = req.body as Partial<Metric>;

  const [error, metrics] = await catchError(
    metricService.updateMetric(identifier, metric)
  );

  if (error !== undefined) {
    logger.error(`Failed to update metric: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error updating metric', error: error?.message });
    throw new IsNullError('Error updating metric');
  }

  logger.info('successfully updated metric', metrics);
  res.status(200).json({ message: 'Metric updated successfully.' });
};
