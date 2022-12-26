import { FirestoreError, orderBy, query } from 'firebase/firestore';
import { empty } from 'immuton';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import getUserRatingsRef from '../references/getUserRatingsRef';
import { Rating } from '../resources';

export default function useUserRatings(profileId: string): [Rating[], boolean, FirestoreError | undefined] {
  const collectionRef = getUserRatingsRef({ profileId });
  const q = query(collectionRef, orderBy('createdAt', 'asc'));
  const [participants, isLoading, error] = useCollectionData<Rating>(q);
  return [participants ?? empty, isLoading, error];
}
