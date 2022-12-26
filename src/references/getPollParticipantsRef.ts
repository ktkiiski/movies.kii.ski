import { collection } from 'firebase/firestore';
import { participantConverter } from '../converters';
import { db } from '../firebase';
import { Participant } from '../resources';

export default function getPollParticipantsRef({ pollId }: Pick<Participant, 'pollId'>) {
  return collection(db, 'polls', pollId, 'participants').withConverter(participantConverter);
}
