import { Router } from 'express';
import { submitVote } from '@/controllers/voteController';

const router = Router();

/**
 * @swagger
 * /vote:
 *   post:
 *     summary: Submit a vote for a specific pool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               voter:
 *                 type: string
 *                 description: Address of the voter
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool (from Allo) to which the vote is submitted
 *                 example: "609"
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161
 *               ballot:
 *                 type: array
 *                 description: Array of votes for metrics
 *                 items:
 *                   type: object
 *                   properties:
 *                     metricId:
 *                       type: number
 *                       description: ID of the metric
 *                     voteShare:
 *                       type: number
 *                       description: Vote share percentage allocated to the metric
 *                 example:
 *                   - metricId: 1
 *                     voteShare: 50
 *                   - metricId: 2
 *                     voteShare: 50
 *             required:
 *               - voter
 *               - alloPoolId
 *               - chainId
 *               - ballot
 *     responses:
 *       201:
 *         description: Vote submitted successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', submitVote);

export default router;
