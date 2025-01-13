import {
  createPool,
  syncPool,
  calculateDistribution,
  finalizeDistribution,
} from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pool:
 *   post:
 *     summary: Creates a pool
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

/**
 * @swagger
 * /pool/sync:
 *   post:
 *     summary: Syncs a pools applications with the given alloPoolId and chainId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to sync
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161  # Example of chainId (Arbitrum)
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       200:
 *         description: Pool synced successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 */
router.post('/sync', syncPool);

/**
 * @swagger
 * /pool/calculate:
 *   post:
 *     summary: Calculates the distribution of a pool based on chainId and alloPoolId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to calculate
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161  # Example of chainId (Arbitrum)
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       200:
 *         description: Distribution calculated successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 */
router.post('/calculate', calculateDistribution);

/**
 * @swagger
 * /pool/finalize:
 *   post:
 *     summary: Finalizes the distribution of a pool based on chainId and alloPoolId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to finalize
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161  # Example of chainId (Arbitrum)
 */
router.post('/finalize', finalizeDistribution);

export default router;
