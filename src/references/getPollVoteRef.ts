import { doc } from 'firebase/firestore';
import { voteConverter } from '../converters';
import { db } from '../firebase';
import { Vote } from '../resources';
import getComboundId from '../utils/getComboundId';

export default function getPollVoteRef({ pollId, profileId, movieId }: Pick<Vote, 'pollId' | 'profileId' | 'movieId'>) {
  const voteId = getComboundId(profileId, String(movieId));
  return doc(db, 'polls', pollId, 'votes', voteId).withConverter(voteConverter);
}
