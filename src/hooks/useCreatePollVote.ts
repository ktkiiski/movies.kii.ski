import { useCallback } from 'react';
import getPollVoteRef from '../references/getPollVoteRef';
import { Vote } from '../resources';
import upsert from '../utils/upsert';
import useRefreshProfile from './useRefreshProfile';

export default function useCreatePollVote(): (vote: Omit<Vote, 'createdAt' | 'updatedAt'>) => Promise<void> {
  const refreshProfile = useRefreshProfile();
  return useCallback(
    async (vote) => {
      const docRef = getPollVoteRef(vote);
      await Promise.all([
        refreshProfile(),
        upsert(
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
        ),
      ]);
    },
    [refreshProfile],
  );
}
