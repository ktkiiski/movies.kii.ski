import { doc } from 'firebase/firestore';
import { participantConverter } from '../converters';
import { db } from '../firebase';
import { Participant } from '../resources';

export default function getPollParticipantRef({ pollId, profileId }: Pick<Participant, 'pollId' | 'profileId'>) {
  return doc(db, 'polls', pollId, 'participants', profileId).withConverter(participantConverter);
}
