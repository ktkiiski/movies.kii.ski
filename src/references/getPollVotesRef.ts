import { collection } from 'firebase/firestore';
import { voteConverter } from '../converters';
import { db } from '../firebase';
import { Vote } from '../resources';

export default function getPollVotesRef({ pollId }: Pick<Vote, 'pollId'>) {
  return collection(db, 'polls', pollId, 'votes').withConverter(voteConverter);
}
