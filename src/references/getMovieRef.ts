import { doc } from 'firebase/firestore';
import { movieConverter } from '../converters';
import { db } from '../firebase';
import { Movie } from '../resources';

export default function getMovieRef({ id }: Pick<Movie, 'id'>) {
  return doc(db, 'movies', String(id)).withConverter(movieConverter);
}
