import { type Vote } from '@/entity/Vote';
import { BadRequestError } from '@/errors';
import { voteRepository } from '@/repository';

class VoteService {
  async saveVote(voteData: Partial<Vote>): Promise<void> {
    // Check if sum of ballot of voteShare is <100 else throw error
    const sumOfVoteShare =
      voteData?.ballot?.reduce((acc, curr) => acc + curr.voteShare, 0) ?? 0;
    if (sumOfVoteShare > 100) {
      throw new BadRequestError('Sum of voteShare must be less than 100');
    }

    // Check if vote already exists for the voter and pool
    const existingVote = await voteRepository.findOne({
      where: {
        voter: voteData.voter,
        poolId: voteData.pool?.id,
      },
    });

    if (existingVote !== null) {
      // Update existing vote
      voteRepository.merge(existingVote, voteData);
      await voteRepository.save(existingVote);
      return;
    }

    // Create new vote
    const newVote = voteRepository.create(voteData);
    await voteRepository.save(newVote);
  }

  async getVotesByChainIdAndAlloPoolId(
    chainId: number,
    alloPoolId: string
  ): Promise<Vote[] | null> {
    return await voteRepository.find({
      where: { chainId, alloPoolId },
    });
  }
}

const voteService = new VoteService();
export default voteService;
