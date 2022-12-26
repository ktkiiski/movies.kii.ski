import { doc } from 'firebase/firestore';
import { candidateConverter } from '../converters';
import { db } from '../firebase';
import { Candidate } from '../resources';

export default function getPollCandidateRef({ pollId, movieId }: Pick<Candidate, 'pollId' | 'movieId'>) {
  return doc(db, 'polls', pollId, 'candidates', String(movieId)).withConverter(candidateConverter);
}
