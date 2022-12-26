import { useCallback } from 'react';
import getPollCandidateRef from '../references/getPollCandidateRef';
import { Candidate } from '../resources';
import upsert from '../utils/upsert';

export default function useCreatePollCandidate(): (
  candidate: Omit<Candidate, 'createdAt' | 'updatedAt'>,
) => Promise<void> {
  return useCallback(async (candidate) => {
    const docRef = getPollCandidateRef(candidate);
    await upsert(
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
    );
  }, []);
}
