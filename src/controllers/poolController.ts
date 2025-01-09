import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import applicationService from '@/service/ApplicationService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import { type RoundWithApplications as IndexerRoundWithApplications } from '@/ext/indexer';

import { BadRequestError, IsNullError } from '@/errors';
import { EligibilityType } from '@/entity/EligibilityCriteria';

const logger = createLogger();

interface CreatePoolRequest {
  chainId: number;
  alloPoolId: string;
  metricsIds: number[];
  eligibilityType: EligibilityType;
  eligibilityData: object;
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

  // Log the receipt of the update request
  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // Check if the eligibility type is supported
  if (eligibilityType !== EligibilityType.Linear) {
    res.status(400).json({ message: 'Eligibility type not supported' });
    throw new BadRequestError('Eligibility type not supported');
  }

  // ---- Get or create the pool ----
  // Upsert the pool with the fetched data
  const [error, pool] = await catchError(
    poolService.createNewPool(
      chainId,
      alloPoolId,
      eligibilityType,
      eligibilityData,
      metricsIds
    )
  );

  // Handle errors during the upsert operation
  if (error != null || pool == null) {
    logger.error(`Failed to upsert pool: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error upserting pool', error: error?.message });
    throw new IsNullError(`Error upserting pool`);
  }

  // Log success and respond to the request
  logger.info('successfully created pool', pool);
  res.status(200).json({ message: 'pool created successfully' });
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
