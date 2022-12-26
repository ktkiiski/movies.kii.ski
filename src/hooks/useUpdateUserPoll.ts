import { setDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getPollRef from '../references/getPollRef';
import { Poll } from '../resources';

export default function useUpdateUserPoll(): (poll: Omit<Poll, 'updatedAt'>) => Promise<void> {
  return useCallback(async (poll) => {
    const docRef = getPollRef(poll);
    return setDoc(docRef, {
      ...poll,
      updatedAt: new Date(), // TODO: serverTimestamp()
    });
  }, []);
}
