import { FirestoreError, orderBy, query } from 'firebase/firestore';
import { empty } from 'immuton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import getPollVotesRef from '../references/getPollVotesRef';
import { Vote } from '../resources';

export default function usePollVotes(pollId: string): [Vote[], boolean, FirestoreError | undefined] {
  const collectionRef = getPollVotesRef({ pollId });
  const q = query(collectionRef, orderBy('createdAt', 'asc'));
  const [participants, isLoading, error] = useCollectionData<Vote>(q);
  return [participants ?? empty, isLoading, error];
}
