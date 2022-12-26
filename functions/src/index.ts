import * as admin from 'firebase-admin';
import { getFunctions } from 'firebase-admin/functions';
import * as functions from 'firebase-functions';
import { defineString } from 'firebase-functions/v2/params';
import { Movie, MovieSearchResult, movieSerializer } from './movies';
import * as tmdb from './tmdb';

admin.initializeApp();

// Parameters
const tmdbApiKeyParam = defineString('TMDB_API_KEY');

const movieConverter: FirebaseFirestore.FirestoreDataConverter<Movie> = {
  toFirestore(obj: Movie) {
    return movieSerializer.serialize(obj);
  },
  fromFirestore(doc) {
    return movieSerializer.deserialize(doc.data());
  },
};

export const searchMovies = functions.https.onCall(async (inputs): Promise<MovieSearchResult[]> => {
  const { query } = inputs;
  const apiKey = tmdbApiKeyParam.value();
  const db = admin.firestore();
  const allSearchResults = await tmdb.searchMovies(query, apiKey);
  const searchResults = allSearchResults.slice(0, 10);
  const taskQueue = getFunctions().taskQueue('retrieveMovieTask');
  await Promise.all(
    searchResults.map(async (searchResult) => {
      const movieRef = db.doc(`movies/${searchResult.id}`).withConverter(movieConverter);
      const movie = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(movieRef);
        if (doc.exists) {
          return doc.data();
        }
        const now = new Date();
        const newMovie: Movie = {
          ...searchResult,
          type: 'movie',
          createdAt: now,
          updatedAt: now,
          genres: [],
          languages: [],
          imdbId: null,
          tagline: null,
          homePageUrl: null,
          runtime: null,
          budget: null,
          revenue: null,
        };
        transaction.set(movieRef, newMovie);
        return newMovie;
      });
      if (!movie || +new Date() - +movie.updatedAt > 60 * 60 * 1000) {
        await taskQueue.enqueue({ id: searchResult.id });
      }
    }),
  );
  return searchResults;
});

export const retrieveMovieTask = functions.tasks
  .taskQueue({
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 5,
    },
    rateLimits: {
      maxConcurrentDispatches: 3,
    },
  })
  .onDispatch(async (data) => {
    const id = data.id as number;
    const apiKey = tmdbApiKeyParam.value();
    const db = admin.firestore();
    const movie = await tmdb.retrieveMovie(id, apiKey);
    if (movie) {
      const movieRef = db.doc(`movies/${id}`).withConverter(movieConverter);
      await movieRef.set(movie);
    }
  });
