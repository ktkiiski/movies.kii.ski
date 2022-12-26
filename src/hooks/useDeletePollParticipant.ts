import { deleteDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getPollParticipantRef from '../references/getPollParticipantRef';
import { Participant } from '../resources';

export default function useDeletePollParticipant(): (
  participant: Pick<Participant, 'pollId' | 'profileId'>,
) => Promise<void> {
  return useCallback(async (participant) => {
    const docRef = getPollParticipantRef(participant);
    return deleteDoc(docRef);
  }, []);
}
