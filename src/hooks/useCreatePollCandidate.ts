import { useCallback } from 'react';
import getPollCandidateRef from '../references/getPollCandidateRef';
import { Candidate } from '../resources';
import upsert from '../utils/upsert';
import useRefreshProfile from './useRefreshProfile';

export default function useCreatePollCandidate(): (
  candidate: Omit<Candidate, 'createdAt' | 'updatedAt'>,
) => Promise<void> {
  const refreshProfile = useRefreshProfile();
  return useCallback(
    async (candidate) => {
      const docRef = getPollCandidateRef(candidate);
      await Promise.all([
        refreshProfile(),
        upsert(
          docRef,
          {
            ...candidate,
            updatedAt: new Date(), // TODO: serverTimestamp()
          },
          {
            ...candidate,
            createdAt: new Date(), // TODO: serverTimestamp()
            updatedAt: new Date(), // TODO: serverTimestamp()
          },
        ),
      ]);
    },
    [refreshProfile],
  );
}
