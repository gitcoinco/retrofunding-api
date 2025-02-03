import {
  createPool,
  syncPool,
  calculateDistribution,
  updateEligibilityCriteria,
  setCustomDistribution,
  deleteCustomDistribution,
} from '@/controllers/poolController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /pool:
 *   post:
 *     tags:
 *       - pool
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
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
 *               eligibilityType:
 *                 type: string
 *                 description: The type of eligibility to check
 *                 example: "linear"  # Example of eligibilityType
 *               eligibilityData:
 *                 type: object
 *                 description: The data for the eligibility criteria
 *                 example: {"voters":["0x0D1781F0b693b35939A49831A6C799B938Bd2F80","0x5645bF145C3f1E974D0D7FB91bf3c68592ab5012","0x7b0e91C75AD9ec537083F61356c532bB882ea2Fb","0xB8cEF765721A6da910f14Be93e7684e9a3714123","0x5933fB4969B322220ED8C24f2088633115eCBcc0","0x012dDEb107697252BDA3231a249d4d3bf747EAB6"]} # Example of data
 *               metricIdentifiers:
 *                 type: array
 *                 description: The identifiers of the metrics to associate with the pool
 *                 example: ["userEngagement", "twitterAge", "gasFees"]  # Example of metricsIds
 *             required:
 *               - alloPoolId
 *               - chainId
 *               - eligibilityType
 *               - eligibilityData
 *               - metricIdentifiers
 *     responses:
 *       201:
 *         description: Pool created successfully
 *       400:
 *         description: Invalid poolId or chainId format
 *       500:
 *         description: Internal server error
 */
router.post('/', createPool);

/**
 * @swagger
 * /pool/sync:
 *   put:
 *     tags:
 *       - pool
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
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
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
router.put('/sync', syncPool);

/**
 * @swagger
 * /pool/calculate:
 *   post:
 *     tags:
 *       - pool
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
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
 *             required:
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       200:
 *         description: Distribution calculated successfully
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
router.post('/calculate', calculateDistribution);

/**
 * @swagger
 * /pool/eligibility:
 *   put:
 *     tags:
 *       - pool
 *     summary: Update the eligibility of a pool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
 *               eligibilityType:
 *                 type: string
 *                 description: The type of eligibility to check
 *                 example: "linear"  # Example of eligibilityType
 *               data:
 *                 type: object
 *                 description: The data for the eligibility criteria
 *                 example: { "voters": ["0xB8cEF765721A6da910f14Be93e7684e9a3714123", "0x5645bF145C3f1E974D0D7FB91bf3c68592ab5012"] }  # Example of data
 *             required:
 *               - alloPoolId
 *               - chainId
 *               - eligibilityType
 *               - data
 *     responses:
 *       200:
 *         description: Eligibility checked successfully
 *       400:
 *         description: Invalid eligibilityType, poolId, or chainId format
 *       500:
 *         description: Internal server error
 */
router.put('/eligibility', updateEligibilityCriteria);

/**
 * @swagger
 * /pool/set-distribution:
 *   post:
 *     tags:
 *       - pool
 *     summary: Sets the custom distribution for a pool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 description: The signature of the sender
 *                 example: "0xdeadbeef"  # Example of signature
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
 *               distribution:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     alloApplicationId:
 *                       type: string
 *                       description: The ID of the application
 *                       example: "0"  # Example of application ID
 *                     distributionPercentage:
 *                       type: number
 *                       description: The percentage of distribution
 *                       example: 50  # Example of distribution percentage
 *                 example: [{ "alloApplicationId": "0", "distributionPercentage": 50 }]  # Example of custom distribution data
 *             required:
 *               - signature
 *               - alloPoolId
 *               - chainId
 *               - distribution
 *     responses:
 *       200:
 *         description: Custom distribution set successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/set-distribution', setCustomDistribution);

/**
 * @swagger
 * /pool/delete-distribution:
 *   delete:
 *     tags:
 *       - pool
 *     summary: Deletes the custom distribution for a pool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 description: The signature of the sender
 *                 example: "0xdeadbeef"  # Example of signature
 *               alloPoolId:
 *                 type: string
 *                 description: The ID of the pool
 *                 example: "673"  # Example of poolId
 *               chainId:
 *                 type: number
 *                 description: The chain ID associated with the pool
 *                 example: 11155111 # Example of chainId (Sepolia)
 *             required:
 *               - signature
 *               - alloPoolId
 *               - chainId
 *     responses:
 *       200:
 *         description: Custom distribution deleted successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.delete('/delete-distribution', deleteCustomDistribution);

export default router;
