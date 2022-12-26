import { collection } from 'firebase/firestore';
import { pollConverter } from '../converters';
import { db } from '../firebase';

export default function getPollsRef() {
  return collection(db, 'polls').withConverter(pollConverter);
}
