import { deleteDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import getUserRatingRef from '../references/getUserRatingRef';
import { Rating } from '../resources';

export default function useDeleteRating(): (rating: Pick<Rating, 'profileId' | 'movieId'>) => Promise<void> {
  return useCallback(async (rating) => {
    const docRef = getUserRatingRef(rating);
    return deleteDoc(docRef);
  }, []);
}
