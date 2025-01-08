import { Router } from 'express';
import { addMetrics } from '@/controllers/metricController';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   post:
 *     summary: Adds an array of metrics to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Name of the metric
 *                   example: "User Engagement"
 *                 description:
 *                   type: string
 *                   description: Description of the metric
 *                   example: "Measures how users interact with the application"
 *                 orientation:
 *                   type: string
 *                   enum: [increase, decrease]
 *                   description: Priority of the metric
 *                   example: "increase"
 *                 active:
 *                   type: boolean
 *                   description: Whether the metric is active
 *                   example: true
 *             required:
 *               - name
 *               - description
 *               - orientation
 *               - active
 *     responses:
 *       201:
 *         description: Metrics added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', addMetrics);

export default router;
