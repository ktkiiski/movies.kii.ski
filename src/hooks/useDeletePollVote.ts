import { deleteDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getPollVoteRef from '../references/getPollVoteRef';
import { Vote } from '../resources';

export default function useDeletePollVote(): (vote: Pick<Vote, 'movieId' | 'pollId' | 'profileId'>) => Promise<void> {
  return useCallback(async (vote) => {
    const docRef = getPollVoteRef(vote);
    return deleteDoc(docRef);
  }, []);
}
