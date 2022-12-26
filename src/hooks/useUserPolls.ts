import { FirestoreError, query, where, orderBy } from 'firebase/firestore';
import { empty } from 'immuton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import getPollsRef from '../references/getPollsRef';
import { Poll } from '../resources';

const collectionRef = getPollsRef();

export default function useUserPolls(profileId: string): [Poll[], boolean, FirestoreError | undefined] {
  const q = query(collectionRef, where('profileId', '==', profileId), orderBy('createdAt', 'asc'));
  const [participants, isLoading, error] = useCollectionData<Poll>(q);
  return [participants ?? empty, isLoading, error];
}
