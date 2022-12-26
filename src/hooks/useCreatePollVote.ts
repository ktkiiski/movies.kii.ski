import { useCallback } from 'react';
import getPollVoteRef from '../references/getPollVoteRef';
import { Vote } from '../resources';
import upsert from '../utils/upsert';

export default function useCreatePollVote(): (vote: Omit<Vote, 'createdAt' | 'updatedAt'>) => Promise<void> {
  return useCallback(async (vote) => {
    const docRef = getPollVoteRef(vote);
    await upsert(
      docRef,
      {
        ...vote,
        updatedAt: new Date(), // TODO: serverTimestamp()
      },
      {
        ...vote,
        createdAt: new Date(), // TODO: serverTimestamp()
        updatedAt: new Date(), // TODO: serverTimestamp()
      },
    );
  }, []);
}
