import { httpsCallable } from 'firebase/functions';
import { empty } from 'immuton';
import { useEffect, useState } from 'react';
import { functions } from '../firebase';
import { MovieSearchResult } from '../resources';

const searchMovies = httpsCallable<{ query: string }, unknown[]>(functions, 'searchMovies');

export default function useMovieSearchResults(query: string): [MovieSearchResult[], boolean, Error | null] {
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>(empty);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let isAborted = false;
    setIsLoading(true);
    searchMovies({ query }).then(
      (result) => {
        if (!isAborted) {
          setIsLoading(false);
          try {
            setSearchResults(result.data.map((item) => MovieSearchResult.deserialize(item)));
            setError(null);
          } catch (err) {
            setError(err as Error);
          }
        }
      },
      (searchError) => {
        if (!isAborted) {
          setIsLoading(false);
          setError(searchError);
        }
      },
    );
    return () => {
      isAborted = true;
    };
  }, [query]);
  return [searchResults, isLoading, error];
}
