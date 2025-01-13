import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import applicationService from '@/service/ApplicationService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import {
  indexerClient,
  type RoundWithApplications as IndexerRoundWithApplications,
} from '@/ext/indexer';

import {
  BadRequestError,
  IsNullError,
  NotFoundError,
  ServerError,
} from '@/errors';
import { EligibilityType } from '@/entity/EligibilityCriteria';
import { calculate } from '@/utils/calculate';

const logger = createLogger();

interface CreatePoolRequest {
  chainId: number;
  alloPoolId: string;
  metricsIds: number[];
  eligibilityType: EligibilityType;
  eligibilityData: object;
}

interface ChainIdAlloPoolIdRequest {
  chainId: number;
  alloPoolId: string;
}

/**
 * Creates a pool
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const createPool = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  // Extract chainId and alloPoolId from the request body
  const { chainId, alloPoolId, eligibilityType, eligibilityData, metricsIds } =
    req.body as CreatePoolRequest;

  logger.info(
    `Received create pool request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // Check if the eligibility type is supported
  if (eligibilityType !== EligibilityType.Linear) {
    res.status(400).json({ message: 'Eligibility type not supported' });
    throw new BadRequestError('Eligibility type not supported');
  }

  // Check if pool is there on indexer
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundManager({
      chainId,
      alloPoolId,
    })
  );

  if (errorFetching !== null || indexerPoolData === null) {
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError('Pool not found on indexer');
  }

  // Get or create the pool
  // Create the pool with the fetched data
  const [error, pool] = await catchError(
    poolService.createNewPool(
      chainId,
      alloPoolId,
      eligibilityType,
      eligibilityData,
      metricsIds
    )
  );

  // Handle errors during the create operation
  if (error != null || pool == null) {
    logger.error(`Failed to create pool: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error creating pool', error: error?.message });
    throw new IsNullError(`Error creating pool`);
  }

  logger.info('successfully created pool', pool);
  res.status(200).json({ message: 'pool created successfully' });
};

/**
 * Synchronizes a pool by fetching data from the indexer, updating the pool and it's applications
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const syncPool = async (req: Request, res: Response): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  // Extract chainId and alloPoolId from the request body
  const { chainId, alloPoolId } = req.body as ChainIdAlloPoolIdRequest;

  // Log the receipt of the update request
  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // Fetch pool data from the indexer
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  // Handle errors or missing data from the indexer
  if (errorFetching != null || indexerPoolData == null) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError(`Pool not found on indexer`);
  }

  // Update Applications
  // Update the pool with the applications from the indexer
  await updateApplications(chainId, alloPoolId, indexerPoolData);

  // Log success and respond to the request
  logger.info(
    `successfully synced pool, alloPoolId: ${alloPoolId} chainId: ${chainId}`
  );
  res.status(200).json({ message: 'pool synced successfully' });
};

const updateApplications = async (
  chainId: number,
  alloPoolId: string,
  indexerPoolData: IndexerRoundWithApplications
): Promise<void> => {
  const applicationData = indexerPoolData.applications.map(application => ({
    alloApplicationId: application.id,
    profileId: application.projectId,
  }));

  await applicationService.upsertApplicationsForPool(
    alloPoolId,
    chainId,
    applicationData
  );
};

/**
 * Calculates the distribution of a pool based on chainId and alloPoolId
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const calculateDistribution = async (req, res): Promise<void> => {
  const { chainId, alloPoolId } = req.body as ChainIdAlloPoolIdRequest;

  const [errorFetching, distribution] = await catchError(
    calculate(chainId, alloPoolId)
  );

  if (errorFetching !== null || distribution === undefined) {
    logger.error(`Failed to calculate distribution: ${errorFetching?.message}`);
    res.status(500).json({
      message: 'Error calculating distribution',
      error: errorFetching?.message,
    });
    throw new ServerError(`Error calculating distribution`);
  }

  const [errorUpdating, updatedDistribution] = await catchError(
    poolService.updateDistribution(alloPoolId, chainId, distribution)
  );

  if (errorUpdating !== null || updatedDistribution === null) {
    logger.error(`Failed to update distribution: ${errorUpdating?.message}`);
    res.status(500).json({
      message: 'Error updating distribution',
      error: errorUpdating?.message,
    });
  }

  res.status(200).json({ message: 'Distribution updated successfully' });
};

/**
 * Finalizes the distribution of a pool based on chainId and alloPoolId
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const finalizeDistribution = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { chainId, alloPoolId } = req.body as ChainIdAlloPoolIdRequest;

  const [errorFinalizing, finalizedDistribution] = await catchError(
    poolService.finalizePoolDistribution(alloPoolId, chainId)
  );

  if (errorFinalizing !== null || finalizedDistribution === null) {
    logger.error(
      `Failed to finalize distribution: ${errorFinalizing?.message}`
    );
    res.status(500).json({
      message: 'Error finalizing distribution',
      error: errorFinalizing?.message,
    });
  }

  res.status(200).json({ message: 'Distribution finalized successfully' });
};
