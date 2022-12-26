import { doc, setDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getPollsRef from '../references/getPollsRef';
import { Poll } from '../resources';

export default function useCreateUserPoll(): (
  rating: Omit<Poll, 'id' | 'createdAt' | 'updatedAt'>,
) => Promise<Pick<Poll, 'id'>> {
  return useCallback(async (poll) => {
    const docRef = doc(getPollsRef());
    const { id } = docRef;
    await setDoc(docRef, {
      ...poll,
      id,
      createdAt: new Date(), // TODO: serverTimestamp()
      updatedAt: new Date(), // TODO: serverTimestamp()
    });
    return { id };
  }, []);
}
