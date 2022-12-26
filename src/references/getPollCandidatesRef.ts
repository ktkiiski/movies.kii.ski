import { collection } from 'firebase/firestore';
import { candidateConverter } from '../converters';
import { db } from '../firebase';
import { Candidate } from '../resources';

export default function getPollCandidatesRef({ pollId }: Pick<Candidate, 'pollId'>) {
  return collection(db, 'polls', pollId, 'candidates').withConverter(candidateConverter);
}
