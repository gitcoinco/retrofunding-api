import { Request, Response } from 'express';
import voteService from '@/service/VoteService';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils';
import { BadRequestError } from '@/errors';
import { createLogger } from '@/logger';
import { type Vote } from '@/entity/Vote';
const logger = createLogger();

// Interface for ballot items
interface BallotItem {
  metricId: number;
  voteShare: number;
}

const isValidVote = (obj: any): obj is Partial<Vote> => {
  return (
    typeof obj.voter !== 'string' ||
    typeof obj.alloPoolId !== 'number' ||
    typeof obj.chainId !== 'number' ||
    !Array.isArray(obj.ballot) ||
    obj.ballot.some(
      (item: BallotItem) =>
        typeof item.metricId !== 'number' || typeof item.voteShare !== 'number'
    )
  );
};

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

  const [error, result] = await catchError(
    (async () => {
      const { voter, alloPoolId, chainId, ballot } = req.body;

      // Validate request body
      if (!isValidVote(req.body)) {
        throw new BadRequestError('Invalid request data');
      }

      // Get the pool using PoolService
      const pool = await poolService.getPoolByChainIdAndAlloPoolId(
        chainId,
        alloPoolId.toString()
      );

      if (!pool) {
        throw new BadRequestError('Pool not found');
      }

      // Prepare vote data
      const voteData = {
        voter,
        alloPoolId,
        chainId,
        ballot,
        pool, // Associate the pool entity
        poolId: pool.id,
      };

      // Save the vote using VoteService
      const savedVote = await voteService.saveVote(voteData);

      return savedVote;
    })()
  );

  if (error != null || result == null) {
    logger.error(`Failed to submit vote: ${error?.message}`);
    if (error instanceof BadRequestError) {
      res.status(400).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: 'Error submitting vote', error: error?.message });
    }
    return;
  }

  logger.info('Vote submitted successfully', result);
  res
    .status(201)
    .json({ message: 'Vote submitted successfully', data: result });
};
