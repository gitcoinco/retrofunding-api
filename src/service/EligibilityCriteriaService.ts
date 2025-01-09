import { EligibilityCriteria } from '@/entity/EligibilityCriteria';
import { eligibilityCriteriaRepository } from '@/repository';

class EligibilityCriteriaService {
  async saveEligibilityCriteria(
    eligibilityCriteria: Partial<EligibilityCriteria>
  ): Promise<EligibilityCriteria> {
    return await eligibilityCriteriaRepository.save(eligibilityCriteria);
  }

  async getEligibilityCriteriaByChainIdAndAlloPoolId(
    chainId: number,
    alloPoolId: string
  ): Promise<EligibilityCriteria | null> {
    return await eligibilityCriteriaRepository.findOne({ where: { chainId, alloPoolId } });
  }
}

const eligibilityCriteriaService = new EligibilityCriteriaService();
export default eligibilityCriteriaService;
