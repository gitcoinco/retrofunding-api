import { Router } from 'express';
import { addMetrics, updateMetric } from '@/controllers/metricController';

const router = Router();

/**
 * @swagger
 * /metrics:
 *   post:
 *     tags:
 *       - metrics
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
 *                 identifier:
 *                   type: string
 *                   description: Identifier of the metric
 *                   example: "userEngagement"
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
 *                 enabled:
 *                   type: boolean
 *                   description: Whether the metric is enabled
 *                   example: true
 *             required:
 *               - identifier
 *               - name
 *               - description
 *               - orientation
 *               - enabled
 *     responses:
 *       201:
 *         description: Metrics added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', addMetrics);

/**
 * @swagger
 * /metrics/{identifier}:
 *   put:
 *     tags:
 *       - metrics
 *     summary: Updates a metric
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         description: The identifier of the metric to update
 *         schema:
 *           type: string
 *           example: "userEngagement"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Whether the metric is enabled
 *                 example: true
 *     responses:
 *       200:
 *         description: Metric updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.put('/:identifier', updateMetric);

export default router;
