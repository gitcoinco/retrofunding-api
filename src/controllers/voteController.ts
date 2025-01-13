import { type Request, type Response } from 'express';
import voteService from '@/service/VoteService';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { BadRequestError, ServerError } from '@/errors';
import { createLogger } from '@/logger';
import { calculate } from '@/utils/calculate';
import { type Pool } from '@/entity/Pool';
import { type Vote } from '@/entity/Vote';
const logger = createLogger();

/**
 * Submits a vote for a given pool
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const submitVote = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  const { voter, alloPoolId, chainId, ballot } = req.body;
  if (
    typeof voter !== 'string' ||
    typeof alloPoolId !== 'string' ||
    typeof chainId !== 'number' ||
    (Array.isArray(ballot) &&
      ballot.every(
        item =>
          typeof item.metricName === 'string' &&
          (item.metricId === undefined || typeof item.metricId === 'number') &&
          typeof item.voteShare === 'number'
      ))
  ) {
    throw new BadRequestError('Invalid request data');
  }

  // Get the pool using PoolService
  const pool = await poolService.getPoolByChainIdAndAlloPoolId(
    chainId,
    alloPoolId.toString()
  );

  if (pool === null) {
    res.status(404).json({ message: 'Pool not found' });
    throw new BadRequestError('Pool not found');
  }

  if (!(await isVoterEligible(pool, voter))) {
    res.status(401).json({ message: 'Not Authorzied' });
    throw new BadRequestError('Not Authorzied');
  }

  const [error, result] = await catchError(
    voteService.saveVote({
      voter,
      alloPoolId,
      chainId,
      ballot,
      pool,
      poolId: pool.id,
    })
  );

  if (error !== null || result === null) {
    res
      .status(500)
      .json({ message: 'Error submitting vote', error: error?.message });
    throw new ServerError(`Error submitting vote`);
  }

  // Trigger the distribution without waiting
  void calculate(chainId, alloPoolId);

  logger.info('Vote submitted successfully', result);
  res.status(201).json({ message: 'Vote submitted successfully' });
};

const isVoterEligible = async (pool: Pool, voter: string): Promise<boolean> => {
  // TODO: Check if voter is eligible based on pool eligibility type
  // TODO: also validate is sender is the voter
  return await Promise.resolve(true);
};

/**
 * Predicts the distribution of a pool based on chainId and alloPoolId and ballot
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const predictDistribution = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { alloPoolId, chainId, ballot } = req.body;

  if (
    typeof alloPoolId !== 'string' ||
    typeof chainId !== 'number' ||
    !Array.isArray(ballot) ||
    (Array.isArray(ballot) &&
      ballot.every(
        item =>
          typeof item.metricName === 'string' &&
          (item.metricId === undefined || typeof item.metricId === 'number') &&
          typeof item.voteShare === 'number'
      ))
  ) {
    throw new BadRequestError('Invalid request data');
  }

  const unAccountedBallots: Partial<Vote> = {
    ballot,
  };

  const [errorFetching, distribution] = await catchError(
    calculate(chainId, alloPoolId, unAccountedBallots)
  );

  if (errorFetching !== null || distribution === undefined) {
    logger.error(`Failed to calculate distribution: ${errorFetching?.message}`);
    res.status(500).json({
      message: 'Error calculating distribution',
      error: errorFetching?.message,
    });
    throw new ServerError(`Error calculating distribution`);
  }

  logger.info('Distribution predicted successfully', distribution);
  res.status(200).json(distribution);
};
