import { deleteDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getPollCandidateRef from '../references/getPollCandidateRef';
import { Candidate } from '../resources';

export default function useDeletePollCandidate(): (
  poll: Pick<Candidate, 'movieId' | 'pollId' | 'profileId'>,
) => Promise<void> {
  return useCallback(async (candidate) => {
    const docRef = getPollCandidateRef(candidate);
    return deleteDoc(docRef);
  }, []);
}
