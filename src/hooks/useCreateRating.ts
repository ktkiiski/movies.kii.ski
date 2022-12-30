import { useCallback } from 'react';
import getUserRatingRef from '../references/getUserRatingRef';
import { Rating } from '../resources';
import upsert from '../utils/upsert';
import useRefreshProfile from './useRefreshProfile';

export default function useCreateRating(): (rating: Pick<Rating, 'movieId' | 'profileId' | 'value'>) => Promise<void> {
  const refreshProfile = useRefreshProfile();
  return useCallback(
    async (rating) => {
      const docRef = getUserRatingRef(rating);
      await Promise.all([
        refreshProfile(),
        upsert(
          docRef,
          {
            ...rating,
            updatedAt: new Date(), // TODO: serverTimestamp()
          },
          {
            ...rating,
            createdAt: new Date(), // TODO: serverTimestamp()
            updatedAt: new Date(), // TODO: serverTimestamp()
          },
        ),
      ]);
    },
    [refreshProfile],
  );
}
