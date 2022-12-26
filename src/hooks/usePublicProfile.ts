import { FirestoreError } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import getPublicProfileRef from '../references/getPublicProfileRef';
import { PublicProfile } from '../resources';

export default function usePublicProfile(
  profileId: string,
): [PublicProfile | undefined, boolean, FirestoreError | undefined] {
  const docRef = getPublicProfileRef({ id: profileId });
  const [profile, isLoading, error] = useDocumentData<PublicProfile>(docRef);
  return [profile, isLoading, error];
}
