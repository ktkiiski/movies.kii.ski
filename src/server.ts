import { chunkify, flatMapAsync, flatMapAsyncParallel, toArray, toFlattenArray } from 'broilerkit/async';
import { create, destroy, initiate, retrieve, scan, update, upsert, write } from 'broilerkit/db';
import { catchNotFound } from 'broilerkit/errors';
import { Created, HttpStatus, isResponse, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import build from 'immuton/build';
import order from 'immuton/order';
import * as api from './api';
import { parseImdbRatingsCsv } from './imdb';
import { BasePoll, Candidate, Movie, Participant, Poll, PollParticipant, Profile, Rating, Vote } from './resources';
import { retrieveMovie, retrieveMovieByImdbId, searchMovies } from './tmdb';

export default implementAll(api).using({
  createUserPoll: async (input, {db, auth}) => {
    const now = new Date();
    const id = identifier(now);
    const [, poll] = await db.batch([
      create(BasePoll, {
        ...input,
        id,
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
      retrieve(Poll, { id }),
      write(Profile, {
        ...auth,
      }),
    ]);
    return new Created(poll);
  },
  updateUserPoll: async ({id, ...changes}, {db, auth}) => {
    const now = new Date();
    const [poll] = await db.batch([
      update(Poll, {id}, { ...changes, updatedAt: now }),
      write(Profile, auth),
    ]);
    return new OK(poll);
  },
  destroyUserPoll: async (query, {db}) => db.run(destroy(Poll, query)),
  createPollCandidate: async (input, {db, auth}) => {
    const now = new Date();
    const [profile, movie, candidate] = await db.batch([
      write(Profile, auth),
      retrieve(Movie, {id: input.movieId}),
      create(Candidate, {
        ...input,
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return new Created({
      ...candidate, profile, movie,
    });
  },
  destroyPollCandidate: async (query, {db}) => db.run(destroy(Candidate, query)),
  createPollParticipant: async ({ pollId }, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [profile, , participant] = await db.batch([
      write(Profile, auth),
      upsert(Participant, {
        pollId,
        profileId,
        createdAt: now,
        updatedAt: now,
      }, {
        updatedAt: now,
      }),
      retrieve(PollParticipant, {
        pollId, profileId,
      }),
    ]);
    return new Created({
      ...participant, profile,
    });
  },
  destroyPollParticipant: async (query, {db}) => db.run(destroy(Participant, query)),
  createPollVote: async ({value, pollId, movieId}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [movie, profile, , vote] = await db.batch([
      // Also ensure that the movie exists
      retrieve(Movie, {id: movieId}),
      // Ensure that the user profile is up-to-date
      write(Profile, auth),
      // Ensure that the user is a participant of the poll
      initiate(Participant, {
        pollId, profileId,
        createdAt: now, updatedAt: now,
      }),
      // Upsert the vote
      upsert(Vote, {
        pollId, movieId,
        profileId, value,
        createdAt: now,
        updatedAt: now,
      }, {
        value, updatedAt: now,
      }),
    ]);
    if (vote.createdAt === now) {
      return new Created({ ...vote, profile, movie });
    }
    return new OK({ ...vote, profile, movie });
  },
  createUserRating: async (input, {db}) => {
    // Ensure that the movie exists
    const movie = await db.run(retrieve(Movie, { id: input.movieId }));
    const now = new Date();
    const rating = await db.run(create(Rating, {
      ...input,
      createdAt: now,
      updatedAt: now,
    }));
    return new Created({ ...rating, movie });
  },
  destroyUserRating: async (query, {db}) => db.run(destroy(Rating, query)),
  uploadUserRatings: async ({file, profileId}, {db, auth, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const rawRatings = parseImdbRatingsCsv(file.data);
    const imdbIdChunks = chunkify(rawRatings.map((rating) => rating.id), 10);
    const movieChunks = flatMapAsync(imdbIdChunks, (imdbIds) => db.scan(scan(Movie, {
      imdbId: imdbIds,
      ordering: 'imdbId',
      direction: 'asc',
    })));
    const existingMovies = await toFlattenArray(movieChunks);
    const moviesByImdbId = build(existingMovies, (movie) => [movie.imdbId as string, movie]);
    const resultRatings = await toArray(flatMapAsyncParallel(4, rawRatings, async function*(rawRating) {
      const imdbId = rawRating.id;
      let movie = moviesByImdbId[imdbId];
      let movieId: number;
      if (!movie) {
        // Unknown IMDb ID. Need to find the movie from the TMDb
        try {
          movie = await retrieveMovieByImdbId(imdbId, apiKey);
        } catch (error) {
          if (isResponse(error, HttpStatus.NotFound)) {
            // Movie not found. Need to ignore this movie
            return;
          }
        }
        const { createdAt, ...movieUpdate } = movie;
        await db.run(upsert(Movie, movie, movieUpdate));
        // tslint:disable-next-line:no-console
        console.log(`Inserted/updated details about a ${movie.type} ${movie.originalTitle} (#${movie.id})`);
      }
      movieId = movie.id;
      const { value } = rawRating;
      const updatedAt = rawRating.modified || rawRating.created;
      // Insert the rating or update the existing rating
      const existingRating = await catchNotFound(
        db.run(retrieve(Rating, { profileId, movieId })),
      );
      if (!existingRating) {
        // Create a new rating
        yield await db.run(create(Rating, {
          createdAt: updatedAt,
          updatedAt,
          movieId,
          profileId,
          value,
        }));
        // tslint:disable-next-line:no-console
        console.log(`Created a new rating for the ${movie.type} ${movieId} of user ${profileId} with value ${value}`);
      } else if (updatedAt > existingRating.updatedAt) {
        yield await db.run(update(Rating, { movieId, profileId }, { value, updatedAt }));
        // tslint:disable-next-line:no-console
        console.log(`Updated the rating for the ${movie.type} ${movieId} of user ${profileId} with value ${value}`);
      } else {
        yield existingRating;
        // tslint:disable-next-line:no-console
        console.log(`A more or equally recent rating for the ${movie.type} ${movieId} of user ${profileId} already exists with value ${existingRating.value}`);
      }
    }));
    const now = new Date();
    return new Created({
      id: identifier(now),
      createdAt: now,
      ratingCount: resultRatings.length,
      profileId: auth.id,
    });
  },
  createPollRating: async ({pollId, movieId, value}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    // Ensure that the movie, candidate & participant exists
    const [movie] = await db.batch([
      retrieve(Movie, { id: movieId }),
      retrieve(Candidate, { pollId, movieId }),
      retrieve(Participant, { pollId, profileId }),
      write(Profile, { ...auth }),
    ]);
    const rating = await db.run(write(Rating, {
      movieId, profileId,
      value,
      createdAt: now,
      updatedAt: now,
    }));
    return new Created({
      pollId,
      movie,
      profile: { id: auth.id, name: auth.name, picture: auth.picture },
      ...rating,
    });
  },
  destroyPollCandidateRating: async ({pollId, movieId, profileId}, {db}) => {
    // Ensure that candidate and participant exists
    await db.batch([
      retrieve(Candidate, { pollId, movieId }),
      retrieve(Participant, { pollId, profileId }),
      destroy(Rating, {profileId, movieId}),
    ]);
  },
  updatePollVote: async ({value, profileId, pollId, movieId}, {db, auth}) => {
    // Find the related resources, ensuring that they exist
    const now = new Date();
    const [movie, profile, , vote] = await db.batch([
      // Also ensure that the movie exists
      retrieve(Movie, {id: movieId}),
      // Ensure that the user profile is up-to-date
      write(Profile, auth),
      // Ensure that the user is a participant of the poll
      initiate(Participant, {
        pollId, profileId,
        createdAt: now, updatedAt: now,
      }),
      // Upsert the vote
      update(Vote, { profileId, pollId, movieId }, {
        value,
        updatedAt: now,
      }),
    ]);
    // Vote already exists -> update it
    return new OK({ ...vote, profile, movie });
  },
  destroyPollVote: async (query, {db}) => db.run(destroy(Vote, query)),
  retrieveMovie: async ({id}, {db, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const movie = await retrieveMovie(id, apiKey);
    // TODO: Do not overwrite the creation date
    return await db.run(write(Movie, movie));
  },
  searchMovies: async ({ordering, since, direction, query}, {environment}) => {
    const apiKey = environment.TMDBApiKey;
    const items = await searchMovies(query, apiKey);

    // Limit the number of search results for throttling the TMDb API usage
    return {
      results: order(items.slice(0, 6), ordering, direction, since),
      next: null,
    };
  },
});
