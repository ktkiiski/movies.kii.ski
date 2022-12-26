import { FirestoreError, orderBy, query } from 'firebase/firestore';
import { empty } from 'immuton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import getPollCandidatesRef from '../references/getPollCandidatesRef';
import { Candidate } from '../resources';

export default function usePollCandidates(pollId: string): [Candidate[], boolean, FirestoreError | undefined] {
  const collectionRef = getPollCandidatesRef({ pollId });
  const q = query(collectionRef, orderBy('createdAt', 'asc'));
  const [candidates, isLoading, error] = useCollectionData<Candidate>(q);
  return [candidates ?? empty, isLoading, error];
}
