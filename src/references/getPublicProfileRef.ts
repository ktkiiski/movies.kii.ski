import { doc } from 'firebase/firestore';
import { profileConverter } from '../converters';
import { db } from '../firebase';
import { PublicProfile } from '../resources';

export default function getPublicProfileRef({ id }: Pick<PublicProfile, 'id'>) {
  return doc(db, 'profiles', id).withConverter(profileConverter);
}
