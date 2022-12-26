import { useCallback } from 'react';
import getPollParticipantRef from '../references/getPollParticipantRef';
import { Participant } from '../resources';
import upsert from '../utils/upsert';

export default function useCreatePollParticipant(): (
  participant: Omit<Participant, 'createdAt' | 'updatedAt'>,
) => Promise<void> {
  return useCallback(async (participant) => {
    const docRef = getPollParticipantRef(participant);
    await upsert(
      docRef,
      {
        ...participant,
        updatedAt: new Date(), // TODO: serverTimestamp()
      },
      {
        ...participant,
        createdAt: new Date(), // TODO: serverTimestamp()
        updatedAt: new Date(), // TODO: serverTimestamp()
      },
    );
  }, []);
}
