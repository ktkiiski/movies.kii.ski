import { collection } from 'firebase/firestore';
import { ratingConverter } from '../converters';
import { db } from '../firebase';
import { Rating } from '../resources';

export default function getUserRatingsRef({ profileId }: Pick<Rating, 'profileId'>) {
  return collection(db, 'profiles', profileId, 'ratings').withConverter(ratingConverter);
}
