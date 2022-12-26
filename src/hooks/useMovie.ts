import { FirestoreError } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import getMovieRef from '../references/getMovieRef';
import { Movie } from '../resources';

export default function useMovie(movieId: number): [Movie | undefined, boolean, FirestoreError | undefined] {
  const docRef = getMovieRef({ id: movieId });
  const [movie, isLoading, error] = useDocumentData<Movie>(docRef);
  return [movie, isLoading, error];
}
