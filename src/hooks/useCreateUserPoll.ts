import { doc, setDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getPollsRef from '../references/getPollsRef';
import { Poll } from '../resources';
import useRefreshProfile from './useRefreshProfile';

export default function useCreateUserPoll(): (
  rating: Omit<Poll, 'id' | 'createdAt' | 'updatedAt'>,
) => Promise<Pick<Poll, 'id'>> {
  const refreshProfile = useRefreshProfile();
  return useCallback(
    async (poll) => {
      const docRef = doc(getPollsRef());
      const { id } = docRef;
      await Promise.all([
        refreshProfile(),
        setDoc(docRef, {
          ...poll,
          id,
          createdAt: new Date(), // TODO: serverTimestamp()
          updatedAt: new Date(), // TODO: serverTimestamp()
        }),
      ]);
      return { id };
    },
    [refreshProfile],
  );
}
