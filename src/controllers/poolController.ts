import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import applicationService from '@/service/ApplicationService';
import {
  catchError,
  isPoolFinalised,
  isPoolManager,
  validateRequest,
} from '@/utils';
import { createLogger } from '@/logger';
import {
  indexerClient,
  type RoundWithApplications as IndexerRoundWithApplications,
} from '@/ext/indexer';

import {
  ActionNotAllowedError,
  BadRequestError,
  IsNullError,
  NotFoundError,
  ServerError,
} from '@/errors';
import { EligibilityType } from '@/entity/EligibilityCriteria';
import { calculate } from '@/utils/calculate';
import eligibilityCriteriaService from '@/service/EligibilityCriteriaService';
import { type PoolIdChainId } from './types';
import { type Distribution } from '@/entity/Pool';
import { type Hex } from 'viem';

const logger = createLogger();

interface CreatePoolRequest extends PoolIdChainId {
  metricIdentifiers: string[];
  eligibilityType: EligibilityType;
  eligibilityData: object;
}

interface EligibilityCriteriaRequest extends PoolIdChainId {
  signature: Hex;
  eligibilityType: EligibilityType;
  data: object;
}

interface SetCustomDistributionRequest extends PoolIdChainId {
  signature: Hex;
  distribution: Distribution[];
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

  const {
    chainId,
    alloPoolId,
    eligibilityType,
    eligibilityData,
    metricIdentifiers,
  } = req.body as CreatePoolRequest;

  logger.info(
    `Received create pool request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // Check if the eligibility type is supported
  if (
    eligibilityType !== EligibilityType.Linear &&
    eligibilityType !== EligibilityType.Weighted
  ) {
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

  if (
    errorFetching !== undefined ||
    indexerPoolData === undefined ||
    indexerPoolData.length === 0
  ) {
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError('Pool not found on indexer');
  }

  // Create the pool with the fetched data
  const [error] = await catchError(
    poolService.createNewPool(
      chainId,
      alloPoolId,
      eligibilityType,
      eligibilityData,
      metricIdentifiers
    )
  );

  // Handle errors during the create operation
  if (error !== undefined) {
    logger.error(`Failed to create pool: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error creating pool', error: error?.message });
    throw new IsNullError(`Error creating pool`);
  }

  logger.info('successfully created pool');
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
  const { chainId, alloPoolId } = req.body as PoolIdChainId;

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
  if (errorFetching !== undefined || indexerPoolData == null) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError(`Pool not found on indexer`);
  }

  // Update Applications
  // Update the pool with the applications from the indexer
  await updateApplications(chainId, alloPoolId, indexerPoolData, res);

  // Log success and respond to the request
  logger.info(
    `successfully synced pool, alloPoolId: ${alloPoolId} chainId: ${chainId}`
  );
  res.status(200).json({ message: 'pool synced successfully' });
};

const updateApplications = async (
  chainId: number,
  alloPoolId: string,
  indexerPoolData: IndexerRoundWithApplications,
  res: Response
): Promise<void> => {
  const applicationData = indexerPoolData.applications.map(application => ({
    alloApplicationId: application.id,
    profileId: application.projectId,
  }));

  const [error] = await catchError(
    applicationService.upsertApplicationsForPool(
      alloPoolId,
      chainId,
      applicationData
    )
  );

  if (error !== undefined) {
    logger.error(`Failed to upsert applications: ${error?.message}`);
    res.status(500).json({
      message: 'Error upserting applications',
      error: error?.message,
    });
    throw new ServerError(`Failed to upsert applications`);
  }
};

/**
 * Calculates the distribution of a pool based on chainId and alloPoolId
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const calculateDistribution = async (req, res): Promise<void> => {
  const { chainId, alloPoolId } = req.body as PoolIdChainId;

  const [errorFetching, distribution] = await catchError(
    calculate(chainId, alloPoolId)
  );

  if (errorFetching !== undefined || distribution === undefined) {
    logger.error(`Failed to calculate distribution: ${errorFetching?.message}`);
    res.status(500).json({
      message: 'Error calculating distribution',
      error: errorFetching?.message,
    });
    throw new ServerError(`Error calculating distribution`);
  }

  const [errorUpdating, updatedDistribution] = await catchError(
    poolService.updateDistribution(
      alloPoolId,
      chainId,
      distribution as unknown as Distribution[]
    )
  );

  if (errorUpdating !== undefined || updatedDistribution === undefined) {
    logger.error(`Failed to update distribution: ${errorUpdating?.message}`);
    res.status(500).json({
      message: 'Error updating distribution',
      error: errorUpdating?.message,
    });
  }

  res.status(200).json({
    message: 'Distribution updated successfully',
    data: distribution,
  });
};

export const updateEligibilityCriteria = async (req, res): Promise<void> => {
  const { signature, eligibilityType, alloPoolId, chainId, data } =
    req.body as EligibilityCriteriaRequest;

  // Log the receipt of the update request
  logger.info(
    `Received update eligibility criteria request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  if (
    !(await isPoolManager(
      { alloPoolId, chainId },
      signature,
      chainId,
      alloPoolId
    ))
  ) {
    res.status(401).json({ message: 'Not Authorzied' });
    throw new BadRequestError('Not Authorzied');
  }

  const [error] = await catchError(
    eligibilityCriteriaService.saveEligibilityCriteria({
      chainId,
      alloPoolId,
      eligibilityType,
      data,
    })
  );

  if (error !== undefined) {
    logger.error(`Failed to update eligibility criteria: ${error?.message}`);
    res.status(500).json({
      message: 'Error updating eligibility criteria',
      error: error?.message,
    });
  }

  res.status(200).json({
    message: 'Eligibility criteria updated successfully',
  });
};

export const setCustomDistribution = async (req, res): Promise<void> => {
  const { alloPoolId, chainId, distribution, signature } =
    req.body as SetCustomDistributionRequest;

  if (
    !(await isPoolManager(
      { alloPoolId, chainId },
      signature,
      chainId,
      alloPoolId
    ))
  ) {
    res.status(401).json({ message: 'Not Authorzied' });
    throw new BadRequestError('Not Authorzied');
  }

  if (await isPoolFinalised(alloPoolId, chainId)) {
    res.status(400).json({ message: 'Pool is finalised' });
    throw new ActionNotAllowedError('Pool is finalised');
  }

  const [error] = await catchError(
    poolService.updateCustomDistribution(alloPoolId, chainId, distribution)
  );

  if (error !== undefined) {
    res.status(500).json({
      message: 'Error setting custom distribution',
      error: error?.message,
    });
    throw new ServerError(`Error setting custom distribution`);
  }

  res.status(201).json({ message: 'Custom distribution set successfully' });
};

export const deleteCustomDistribution = async (req, res): Promise<void> => {
  const { alloPoolId, chainId, signature } =
    req.body as SetCustomDistributionRequest;

  if (
    !(await isPoolManager(
      { alloPoolId, chainId },
      signature,
      chainId,
      alloPoolId
    ))
  ) {
    res.status(401).json({ message: 'Not Authorzied' });
    throw new BadRequestError('Not Authorzied');
  }

  if (await isPoolFinalised(alloPoolId, chainId)) {
    res.status(400).json({ message: 'Pool is finalised' });
    throw new ActionNotAllowedError('Pool is finalised');
  }

  const [error] = await catchError(
    poolService.deleteCustomDistribution(alloPoolId, chainId)
  );

  if (error !== undefined) {
    res.status(500).json({
      message: 'Error deleting custom distribution',
      error: error?.message,
    });
    throw new ServerError(`Error deleting custom distribution`);
  }

  res.status(200).json({ message: 'Custom distribution deleted successfully' });
};
