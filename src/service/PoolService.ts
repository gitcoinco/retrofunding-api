import { type EligibilityType } from '@/entity/EligibilityCriteria';
import { type Distribution, type Pool } from '@/entity/Pool';
import { AlreadyExistsError, NotFoundError } from '@/errors';
import { poolRepository } from '@/repository';
import eligibilityCriteriaService from './EligibilityCriteriaService';
import metricService from './MetricService';

class PoolService {
  async savePool(pool: Partial<Pool>): Promise<Pool> {
    return await poolRepository.save(pool);
  }

  async getPoolById(id: number): Promise<Pool | null> {
    const pool = await poolRepository.findOne({ where: { id } });
    return pool;
  }

  async getPoolByChainIdAndAlloPoolId(
    chainId: number,
    alloPoolId: string
  ): Promise<Pool | null> {
    return await poolRepository.findOne({
      where: { chainId, alloPoolId },
    });
  }

  async createNewPool(
    chainId: number,
    alloPoolId: string,
    eligibilityType: EligibilityType,
    eligibilityData: object,
    metricIdentifiers: string[]
  ): Promise<void> {
    const _pool = await this.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId);
    if (_pool !== null) {
      throw new AlreadyExistsError(`Pool already exists`);
    }

    const eligibilityCriteria =
      await eligibilityCriteriaService.saveEligibilityCriteria({
        chainId,
        alloPoolId,
        eligibilityType,
        data: eligibilityData,
      });

    const metrics =
      await metricService.getEnabledMetricsByIdentifiers(metricIdentifiers);

    if (metrics.length !== metricIdentifiers.length) {
      throw new NotFoundError('Metrics not found/enabled');
    }

    await this.savePool({
      chainId,
      alloPoolId,
      eligibilityCriteria,
      metricIdentifiers,
    });
  }

  async getAllPools(page = 1, limit = 10): Promise<Pool[]> {
    return await poolRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async updateDistribution(
    alloPoolId: string,
    chainId: number,
    distribution: Distribution[]
  ): Promise<Pool> {
    const pool = await this.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId);
    if (pool == null) {
      throw new NotFoundError('Pool not found');
    }

    pool.distribution = distribution;
    return await this.savePool(pool);
  }
}

const poolService = new PoolService();
export default poolService;
