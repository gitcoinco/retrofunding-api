import {
  type EligibilityCriteria,
  EligibilityType,
} from '@/entity/EligibilityCriteria';
import { BadRequestError, NotFoundError, ServerError } from '@/errors';
import { eligibilityCriteriaRepository } from '@/repository';
import { isHex } from 'viem';

interface LinearEligibilityTypeData {
  voters: string[];
}

interface WeightedEligibilityTypeData {
  voters: Record<string, number>;
}

class EligibilityCriteriaService {
  async saveEligibilityCriteria(
    eligibilityCriteria: Partial<EligibilityCriteria>
  ): Promise<EligibilityCriteria> {
    if (
      eligibilityCriteria.chainId == null ||
      eligibilityCriteria.alloPoolId == null
    ) {
      throw new BadRequestError('Chain ID and Allo Pool ID are required');
    }

    validateEligibilityCriteriaData(eligibilityCriteria);

    const result = await eligibilityCriteriaRepository.upsert(
      eligibilityCriteria,
      {
        conflictPaths: ['chainId', 'alloPoolId'],
      }
    );

    const id = result.identifiers[0].id;
    const criteria = await eligibilityCriteriaRepository.findOne({
      where: { id },
    });
    if (criteria === null) {
      throw new ServerError('Unable to fetch saved eligibility criteria');
    }
    return criteria;
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
    console.log('eligibilityCriteria', eligibilityCriteria);
    if (eligibilityCriteria == null) {
      throw new NotFoundError('Eligibility criteria not found');
    }

    if (eligibilityCriteria.eligibilityType === EligibilityType.Linear) {
      console.log('linear');
      const data = eligibilityCriteria.data as LinearEligibilityTypeData;
      return data.voters.includes(voter);
    } else if (
      eligibilityCriteria.eligibilityType === EligibilityType.Weighted
    ) {
      console.log('weighted');
      const data = eligibilityCriteria.data as WeightedEligibilityTypeData;
      return Object.keys(data.voters)
        .map(voter => voter.toLowerCase())
        .includes(voter.toLowerCase());
    }

    return false;
  }
}

const validateEligibilityCriteriaData = (
  eligibilityCriteria: Partial<EligibilityCriteria>
): void => {
  if (eligibilityCriteria.eligibilityType === EligibilityType.Linear) {
    const data = eligibilityCriteria.data as LinearEligibilityTypeData;
    data.voters.forEach((voter: string) => {
      if (!isHex(voter)) {
        throw new BadRequestError('data must be an array of valid addresses');
      }
    });
  } else if (eligibilityCriteria.eligibilityType === EligibilityType.Weighted) {
    const data = eligibilityCriteria.data as WeightedEligibilityTypeData;
    Object.keys(data.voters).forEach((voter: string) => {
      if (!isHex(voter)) {
        throw new BadRequestError('data must be an array of valid addresses');
      }
      const weight = data.voters[voter];
      if (weight === undefined || weight < 0 || weight > 100) {
        throw new BadRequestError('Weight must be between 0 and 100');
      }
    });
  }
};

const eligibilityCriteriaService = new EligibilityCriteriaService();
export default eligibilityCriteriaService;
