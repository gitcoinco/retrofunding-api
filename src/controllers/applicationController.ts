import { type Request, type Response } from 'express';
import applicationService from '@/service/ApplicationService';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { IsNullError, NotFoundError } from '@/errors';
import { createLogger } from '@/logger';
import { indexerClient } from '@/ext/indexer';
import { type PoolIdChainId } from './types';

const logger = createLogger();

interface CreateApplicationRequest extends PoolIdChainId {
  alloApplicationId: string;
}

/**
 * Creates a new application linked to a pool
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  const { alloPoolId, chainId, alloApplicationId } =
    req.body as CreateApplicationRequest;

  logger.info(
    `Received create application request for chainId: ${chainId}, alloPoolId: ${alloPoolId}, alloApplicationId: ${alloApplicationId}`
  );

  // Get or create the pool using PoolService
  const pool = await poolService.getPoolByChainIdAndAlloPoolId(
    chainId,
    alloPoolId
  );

  if (pool === null) {
    res.status(404).json({ message: 'Pool not found' });
    throw new NotFoundError('Pool not found');
  }

  // Fetch application data from the indexer
  const [errorFetching, applicationData] = await catchError(
    indexerClient.getApplicationWithRound({
      chainId,
      roundId: alloPoolId,
      applicationId: alloApplicationId,
    })
  );

  if (errorFetching !== undefined || applicationData === undefined) {
    res.status(404).json({ message: 'Application not found on indexer' });
    throw new NotFoundError('Application not found on indexer');
  }

  // Create application
  const [error, application] = await catchError(
    applicationService.createApplication({
      alloPoolId,
      chainId,
      alloApplicationId,
      pool,
    })
  );

  // Handle errors
  if (error !== undefined || application === null) {
    logger.error(`Failed to create application: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error creating application', error: error?.message });
    throw new IsNullError(`Error creating application`);
  }

  logger.info('application created successfully', application);
  res.status(200).json({
    message: 'application created successfully',
  });
};
