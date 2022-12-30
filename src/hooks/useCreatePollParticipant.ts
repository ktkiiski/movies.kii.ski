import { useCallback } from 'react';
import getPollParticipantRef from '../references/getPollParticipantRef';
import { Participant } from '../resources';
import upsert from '../utils/upsert';
import useRefreshProfile from './useRefreshProfile';

export default function useCreatePollParticipant(): (
  participant: Omit<Participant, 'createdAt' | 'updatedAt'>,
) => Promise<void> {
  const refreshProfile = useRefreshProfile();
  return useCallback(
    async (participant) => {
      const docRef = getPollParticipantRef(participant);
      await Promise.all([
        refreshProfile(),
        upsert(
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
        ),
      ]);
    },
    [refreshProfile],
  );
}
