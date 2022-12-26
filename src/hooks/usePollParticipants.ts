import { FirestoreError, orderBy, query } from 'firebase/firestore';
import { empty } from 'immuton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import getPollParticipantsRef from '../references/getPollParticipantsRef';
import { Participant } from '../resources';

export default function usePollParticipants(pollId: string): [Participant[], boolean, FirestoreError | undefined] {
  const collectionRef = getPollParticipantsRef({ pollId });
  const q = query(collectionRef, orderBy('createdAt', 'asc'));
  const [participants, isLoading, error] = useCollectionData<Participant>(q);
  return [participants ?? empty, isLoading, error];
}
