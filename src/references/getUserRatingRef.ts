import { doc } from 'firebase/firestore';
import { ratingConverter } from '../converters';
import { db } from '../firebase';
import { Rating } from '../resources';

export default function getUserRatingRef({ profileId, movieId }: Pick<Rating, 'profileId' | 'movieId'>) {
  return doc(db, 'profiles', profileId, 'ratings', String(movieId)).withConverter(ratingConverter);
}
