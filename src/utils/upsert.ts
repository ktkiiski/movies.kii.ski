import { DocumentReference, runTransaction, UpdateData, WithFieldValue } from 'firebase/firestore';
import { db } from '../firebase';

export default async function upsert<T>(
  docRef: DocumentReference<T>,
  updateData: UpdateData<T>,
  createData: WithFieldValue<T>,
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const item = await transaction.get(docRef);
    if (item.exists()) {
      transaction.update(docRef, updateData);
    } else {
      transaction.set(docRef, createData);
    }
  });
}
