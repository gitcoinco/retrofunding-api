import { Router } from 'express';
import {
  submitVote,
  predictDistribution,
  getCalculationData,
} from '@/controllers/voteController';

const router = Router();

/**
 * @swagger
 * /vote:
 *   post:
 *     tags:
 *       - vote
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
 *                 example: "0xB8cEF765721A6da910f14Be93e7684e9a3714123"
 *               signature:
 *                 type: string
 *                 description: Signature of the voter
 *                 example: "0xdeadbeef"
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool (from Allo) to which the vote is submitted
 *                 example: "673" # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111
 *               ballot:
 *                 type: array
 *                 description: Array of votes for metrics
 *                 items:
 *                   type: object
 *                   properties:
 *                     metricIdentifier:
 *                       type: string
 *                       description: Metric identifier
 *                     voteShare:
 *                       type: number
 *                       description: Vote share percentage allocated to the metric
 *                 example:
 *                   - metricIdentifier: "userEngagement"
 *                     voteShare: 50
 *                   - metricIdentifier: "twitterAge"
 *                     voteShare: 30
 *                   - metricIdentifier: "gasFees"
 *                     voteShare: 20
 *             required:
 *               - voter
 *               - signature
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

/**
 * @swagger
 * /vote/predict:
 *   post:
 *     tags:
 *       - vote
 *     summary: Predicts the distribution of a pool based on chainId and alloPoolId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool to predict
 *                 example: "673" # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111
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
 *                   - metricIdentifier: "userEngagement"
 *                     voteShare: 20
 *                   - metricIdentifier: "twitterAge"
 *                     voteShare: 60
 *                   - metricIdentifier: "gasFees"
 *                     voteShare: 20
 *             required:
 *               - alloPoolId
 *               - chainId
 *               - ballot
 *     responses:
 *       200:
 *         description: Distribution prediction successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Distribution updated successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       alloApplicationId:
 *                         type: string
 *                         example: "1"
 *                       distributionPercentage:
 *                         type: number
 *                         example: 35.13513513513514
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 */
router.post('/predict', predictDistribution);

/**
 * @swagger
 * /vote/getCalculationData:
 *   post:
 *     tags:
 *       - vote
 *     summary: Get calculation data for vote distribution
 *     description: |
 *       Retrieves essential data required for vote distribution calculations,
 *       including metric identifiers, score mappings, and bounds.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The unique identifier of the funding pool
 *                 example: "673"
 *               chainId:
 *                 type: number
 *                 description: The blockchain network ID where the pool is deployed
 *                 example: 11155111
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       200:
 *         description: Successfully retrieved calculation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pool:
 *                   type: object
 *                   properties:
 *                     metricIdentifiers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["metric1", "metric2", "metric3"]
 *                 isIncreasingMap:
 *                   type: object
 *                   properties:
 *                     metric1:
 *                       type: boolean
 *                     metric2:
 *                       type: boolean
 *                     metric3:
 *                       type: boolean
 *                 applicationToMetricsScores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       alloApplicationId:
 *                         type: string
 *                         example: "1"
 *                       metricIdentifier:
 *                         type: string
 *                         enum: ["metric1", "metric2", "metric3"]
 *                         example: "metric1"
 *                       metricScore:
 *                         type: number
 *                         example: 100
 *                 metricsBounds:
 *                   type: object
 *                   properties:
 *                     metric1:
 *                       type: object
 *                       properties:
 *                         minValue:
 *                           type: number
 *                         maxValue:
 *                           type: number
 *                     metric2:
 *                       type: object
 *                       properties:
 *                         minValue:
 *                           type: number
 *                         maxValue:
 *                           type: number
 *                     metric3:
 *                       type: object
 *                       properties:
 *                         minValue:
 *                           type: number
 *                         maxValue:
 *                           type: number
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Pool not found
 *       500:
 *         description: Internal server error while fetching calculation data
 */
router.post('/getCalculationData', getCalculationData);

export default router;
