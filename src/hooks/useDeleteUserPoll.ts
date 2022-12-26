import { runTransaction } from 'firebase/firestore';
import { useCallback } from 'react';
import { db } from '../firebase';
import getPollRef from '../references/getPollRef';
import { Poll } from '../resources';

export default function useDeleteUserPoll(): (poll: Pick<Poll, 'id' | 'profileId'>) => Promise<void> {
  return useCallback(async (poll) => {
    const { profileId } = poll;
    const docRef = getPollRef(poll);
    await runTransaction(db, async (transaction) => {
      const item = await transaction.get(docRef);
      if (item.data()?.profileId !== profileId) {
        throw new Error('Cannot delete a poll of another user');
      }
      return transaction.delete(docRef);
    });
  }, []);
}
