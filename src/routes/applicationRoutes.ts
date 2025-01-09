import { Router } from 'express';
import { createApplication } from '@/controllers/applicationController';

const router = Router();
/**
 * @swagger
 * /application:
 *   post:
 *     summary: Creates a new application linked to a pool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to link the application to
 *                 example: "609"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 42161  # Example of chainId (Arbitrum)
 *               alloApplicationId:
 *                 type: string
 *                 description: The ID of the application to create
 *                 example: "app-123"  # Example of application ID
 *             required:
 *               - alloPoolId
 *               - chainId
 *               - alloApplicationId
 *     responses:
 *       201:
 *         description: Application created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', createApplication);

export default router;
