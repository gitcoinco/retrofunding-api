import { createPool } from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pool:
 *   post:
 *     summary: Syncs a pool with the given alloPoolId and chainId from the indexer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to create
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161  # Example of chainId (Arbitrum)
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 *     examples:
 *       application/json:
 *         - value:
 *             alloPoolId: "609"
 *             chainId: "42161"
 */
router.post('/', createPool);

export default router;
