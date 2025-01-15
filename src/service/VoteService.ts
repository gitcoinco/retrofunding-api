import { type Vote } from '@/entity/Vote';
import { voteRepository } from '@/repository';

class VoteService {
  async saveVote(voteData: Partial<Vote>): Promise<void> {
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
