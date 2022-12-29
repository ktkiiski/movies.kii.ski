import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { empty } from 'immuton';
import { functions } from '../firebase';
import { MovieSearchResult } from '../resources';

const searchMovies = httpsCallable<{ query: string }, unknown[]>(functions, 'searchMovies');

export default function useMovieSearchResults(query: string): [MovieSearchResult[], boolean, Error | null] {
  const {
    isLoading,
    error,
    data: searchResults,
  } = useQuery<MovieSearchResult[], Error>(['movieSearchResults', query], async () => {
    const result = await searchMovies({ query });
    return result.data.map((item) => MovieSearchResult.deserialize(item));
  });
  return [searchResults ?? empty, isLoading, error];
}
