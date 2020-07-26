import { chunkify, flatMapAsync, flatMapAsyncParallel, toArray, toFlattenArray } from 'broilerkit/async';
import { create, retrieve, scan, update, upsert } from 'broilerkit/db';
import { catchNotFound } from 'broilerkit/errors';
import { HttpStatus, isResponse } from 'broilerkit/http';
import type { DatabaseClient } from 'broilerkit/postgres';
import type { FileStorage } from 'broilerkit/storage';
import build from 'immuton/build';
import { ratingsBucket } from './buckets';
import { parseImdbRatingsCsv } from './imdb';
import { Movie, Rating } from './resources';
import { retrieveMovieByImdbId } from './tmdb';

/**
 * Whenever a new ratings CSV file has been uploaded,
 * parse it and save the ratings for the user profile.
 */
// eslint-disable-next-line import/prefer-default-export
export const onRatingsFileUpload = ratingsBucket.on('create', async ({ key }, { db, environment, storage }) => {
  try {
    const apiKey = environment.TMDBApiKey;
    await updateRatingsFromS3File(key, apiKey, db, storage);
  } finally {
    // TODO: Remove the processed file?
  }
});

async function updateRatingsFromS3File(key: string, apiKey: string, db: DatabaseClient, storage: FileStorage) {
  // eslint-disable-next-line no-console
  console.log(`Loading ratings from bucket ${ratingsBucket.name} with key ${key}…`);
  const { data, userId: profileId } = await storage.retrieve(ratingsBucket, key);
  if (!profileId) {
    throw new Error(`File at key ${key} did not include a user ID`);
  }
  const rawRatings = parseImdbRatingsCsv(data.toString());
  const imdbIdChunks = chunkify(
    rawRatings.map((rating) => rating.id),
    10,
  );
  const movieChunks = flatMapAsync(imdbIdChunks, (imdbIds) =>
    db.scan(
      scan(Movie, {
        imdbId: imdbIds,
        ordering: 'imdbId',
        direction: 'asc',
      }),
    ),
  );
  const existingMovies = await toFlattenArray(movieChunks);
  const moviesByImdbId = build(existingMovies, (movie) => [movie.imdbId as string, movie]);
  const resultRatings = await toArray(
    flatMapAsyncParallel(4, rawRatings, async function* processRating(rawRating) {
      const imdbId = rawRating.id;
      let movie: Movie | undefined = moviesByImdbId[imdbId];
      if (!movie) {
        // Unknown IMDb ID. Need to find the movie from the TMDb
        try {
          movie = await retrieveMovieByImdbId(imdbId, apiKey);
        } catch (error) {
          if (isResponse(error, HttpStatus.NotFound)) {
            // Movie not found. Need to ignore this movie
            return;
          }
          throw error;
        }
        const { createdAt, ...movieUpdate } = movie;
        await db.run(upsert(Movie, movie, movieUpdate));
        // eslint-disable-next-line no-console
        console.log(`Inserted/updated details about a ${movie.type} ${movie.originalTitle} (#${movie.id})`);
      }
      const movieId = movie.id;
      const { value } = rawRating;
      const updatedAt = rawRating.modified || rawRating.created;
      // Insert the rating or update the existing rating
      const existingRating = await catchNotFound(db.run(retrieve(Rating, { profileId, movieId })));
      if (!existingRating) {
        // Create a new rating
        yield await db.run(
          create(Rating, {
            createdAt: updatedAt,
            updatedAt,
            movieId,
            profileId,
            value,
          }),
        );
        // eslint-disable-next-line no-console
        console.log(`Created a new rating for the ${movie.type} ${movieId} of user ${profileId} with value ${value}`);
      } else if (updatedAt > existingRating.updatedAt) {
        yield await db.run(update(Rating, { movieId, profileId }, { value, updatedAt }));
        // eslint-disable-next-line no-console
        console.log(`Updated the rating for the ${movie.type} ${movieId} of user ${profileId} with value ${value}`);
      } else {
        yield existingRating;
        // eslint-disable-next-line no-console
        console.log(
          `A more or equally recent rating for the ${movie.type} ${movieId} of user ${profileId} already exists with value ${existingRating.value}`,
        );
      }
    }),
  );
  // eslint-disable-next-line no-console
  console.log(`Processed ${resultRatings.length} rating(s) for the user ${profileId}`);
}
