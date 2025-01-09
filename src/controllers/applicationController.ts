import { type Request, type Response } from 'express';
import applicationService from '@/service/ApplicationService';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { IsNullError, NotFoundError } from '@/errors';
import { createLogger } from '@/logger';

const logger = createLogger();

interface CreateApplicationRequest {
  chainId: number;
  alloPoolId: string;
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
  // TODO: check if application is there on indexer

  const [error, application] = await catchError(
    applicationService.createApplication({
      chainId,
      alloApplicationId,
      pool,
      poolId: pool.id,
    })
  );

  // Handle errors during the create operation
  if (error != null || application == null) {
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
