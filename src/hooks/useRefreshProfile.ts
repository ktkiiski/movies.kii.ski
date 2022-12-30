import { setDoc } from 'firebase/firestore';
import { useCallback, useMemo } from 'react';
import getPublicProfileRef from '../references/getPublicProfileRef';
import { PublicProfile } from '../resources';
import useUser from './useUser';

export default function useRefreshProfile(): () => Promise<PublicProfile> {
  const user = useUser();
  const id = user?.uid ?? null;
  const name = user?.displayName ?? null;
  const picture = user?.photoURL ?? null;
  const profile = useMemo<PublicProfile | null>(
    () =>
      !id
        ? null
        : {
            id,
            name,
            picture,
          },
    [id, name, picture],
  );
  return useCallback(async () => {
    if (!profile) {
      throw new Error('Cannot refresh the profile of unauthenticated user');
    }
    const docRef = getPublicProfileRef(profile);
    await setDoc(docRef, profile);
    return profile;
  }, [profile]);
}
