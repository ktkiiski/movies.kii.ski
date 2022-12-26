import { doc } from 'firebase/firestore';
import { pollConverter } from '../converters';
import { db } from '../firebase';
import { Poll } from '../resources';

export default function getPollRef({ id }: Pick<Poll, 'id'>) {
  return doc(db, 'polls', id).withConverter(pollConverter);
}
