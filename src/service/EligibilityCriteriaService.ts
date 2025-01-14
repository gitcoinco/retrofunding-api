import {
  type EligibilityCriteria,
  EligibilityType,
} from '@/entity/EligibilityCriteria';
import { NotFoundError } from '@/errors';
import { eligibilityCriteriaRepository } from '@/repository';

interface LinearEligibilityTypeData {
  voters: string[];
}

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
    return await eligibilityCriteriaRepository.findOne({
      where: { chainId, alloPoolId },
    });
  }

  async isVoterEligible(
    chainId: number,
    alloPoolId: string,
    voter: string
  ): Promise<boolean> {
    const eligibilityCriteria =
      await this.getEligibilityCriteriaByChainIdAndAlloPoolId(
        chainId,
        alloPoolId
      );

    if (eligibilityCriteria == null) {
      throw new NotFoundError('Eligibility criteria not found');
    }

    if (eligibilityCriteria.eligibilityType === EligibilityType.Linear) {
      const data = eligibilityCriteria.data as LinearEligibilityTypeData;
      return data.voters.includes(voter);
    }

    return false;
  }
}

const eligibilityCriteriaService = new EligibilityCriteriaService();
export default eligibilityCriteriaService;
