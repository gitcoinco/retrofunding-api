import { type Request, type Response } from 'express';
import voteService from '@/service/VoteService';
import poolService from '@/service/PoolService';
import {
  catchError,
  isPoolFinalised,
  recoverSignerAddress,
  validateRequest,
} from '@/utils';
import {
  ActionNotAllowedError,
  BadRequestError,
  ServerError,
  UnauthorizedError,
} from '@/errors';
import { createLogger } from '@/logger';
import { calculate } from '@/utils/calculate';
import { type Pool } from '@/entity/Pool';
import { type Ballot, type Vote } from '@/entity/Vote';
import eligibilityCriteriaService from '@/service/EligibilityCriteriaService';
import { type Hex } from 'viem';
import { env } from 'process';
import { type PoolIdChainId } from './types';
const logger = createLogger();

interface SubmitVoteRequest extends PoolIdChainId {
  voter: string;
  ballot: Ballot[];
  signature: Hex;
}

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

  const { voter, alloPoolId, chainId, ballot, signature } =
    req.body as SubmitVoteRequest;
  if (
    typeof voter !== 'string' ||
    typeof alloPoolId !== 'string' ||
    typeof chainId !== 'number' ||
    typeof signature !== 'string' ||
    !Array.isArray(ballot) ||
    !ballot.every(
      item =>
        typeof item.metricIdentifier === 'string' &&
        typeof item.voteShare === 'number'
    )
  ) {
    res.status(400).json({ message: 'Invalid request data' });
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

  const [isVoterEligibleError, isVoterEligible] = await catchError(
    checkVoterEligibility({ alloPoolId, chainId }, signature, pool, voter)
  );

  if (isVoterEligibleError !== undefined || isVoterEligible === false) {
    res.status(401).json({ message: 'Not Authorzied' });
    throw new BadRequestError('Not Authorzied');
  }

  if (await isPoolFinalised(alloPoolId, chainId)) {
    res.status(400).json({ message: 'Pool is finalised' });
    throw new ActionNotAllowedError('Pool is finalised');
  }

  const [error] = await catchError(
    voteService.saveVote({
      voter,
      alloPoolId,
      chainId,
      ballot,
      pool,
      poolId: pool.id,
    })
  );

  if (error !== undefined) {
    res
      .status(500)
      .json({ message: 'Error submitting vote', error: error?.message });
    throw new ServerError(`Error submitting vote`);
  }

  // Trigger the distribution without waiting
  void calculate(chainId, alloPoolId);

  logger.info('Vote submitted successfully');
  res.status(201).json({ message: 'Vote submitted successfully' });
};

const checkVoterEligibility = async <T>(
  obj: T,
  signature: Hex,
  pool: Pool,
  voter: string
): Promise<boolean> => {
  if (env.NODE_ENV === 'development' && signature === '0xdeadbeef') {
    logger.info('Skipping signature check in development mode');
  } else {
    const address = await recoverSignerAddress(obj, signature);
    if (address.toLowerCase() !== voter.toLowerCase()) {
      throw new UnauthorizedError('Unauthorized');
    }
  }

  return await eligibilityCriteriaService.isVoterEligible(
    pool.chainId,
    pool.alloPoolId,
    voter
  );
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
    !ballot.every(
      item =>
        typeof item.metricIdentifier === 'string' &&
        typeof item.voteShare === 'number'
    )
  ) {
    res.status(400).json({ message: 'Invalid request data' });
    throw new BadRequestError('Invalid request data');
  }

  const unAccountedBallots: Partial<Vote> = {
    ballot,
  };

  const [errorFetching, distribution] = await catchError(
    calculate(chainId, alloPoolId, unAccountedBallots)
  );

  if (errorFetching !== undefined || distribution === undefined) {
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
