import { useCallback } from 'react';
import getUserRatingRef from '../references/getUserRatingRef';
import { Rating } from '../resources';
import upsert from '../utils/upsert';

export default function useCreateRating(): (rating: Pick<Rating, 'movieId' | 'profileId' | 'value'>) => Promise<void> {
  return useCallback(async (rating) => {
    const docRef = getUserRatingRef(rating);
    await upsert(
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
    );
  }, []);
}
