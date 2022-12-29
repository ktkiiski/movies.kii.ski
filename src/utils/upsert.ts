import { DocumentReference, runTransaction, WithFieldValue } from 'firebase/firestore';
import { db } from '../firebase';

export default async function upsert<T>(
  docRef: DocumentReference<T>,
  updateData: Partial<T>,
  createData: WithFieldValue<T>,
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const item = await transaction.get(docRef);
    if (item.exists()) {
      transaction.set(docRef, { ...item.data(), ...updateData });
    } else {
      transaction.set(docRef, createData);
    }
  });
}
