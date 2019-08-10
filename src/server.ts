import { chunkify, flatMapAsync, flatMapAsyncParallel, toArray, toFlattenArray } from 'broilerkit/async';
import { catchNotFound } from 'broilerkit/errors';
import { Created, HttpStatus, isResponse, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import { order } from 'broilerkit/utils/arrays';
import { isNotNully } from 'broilerkit/utils/compare';
import { buildObject } from 'broilerkit/utils/objects';
import * as api from './api';
import * as db from './db';
import { parseImdbRatingsCsv } from './imdb';
import { retrieveMovie, retrieveMovieByImdbId, searchMovies } from './tmdb';

export default implementAll(api, db).using({
  listUserPolls: async (query, {polls}) => polls.list(query),
  createUserPoll: async (input, {polls, profiles}, {auth}) => {
    const now = new Date();
    const [poll] = await Promise.all([
      polls.create({
        ...input,
        id: identifier(now),
        version: identifier(now),
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new Created(poll);
  },
  retrieveUserPoll: async ({id}, {polls}) => polls.retrieve({id}),
  updateUserPoll: async ({id, ...changes}, {polls, profiles}, {auth}) => {
    const now = new Date();
    const [poll] = await Promise.all([
      polls.update({id}, {
        ...changes,
        version: identifier(now),
        updatedAt: now,
      }),
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new OK(poll);
  },
  destroyUserPoll: async ({id}, {polls}) => polls.destroy({id}),
  retrievePoll: async ({id}, {polls}) => polls.retrieve({id}),
  listPollCandidates: async (query, {candidates, movies, profiles}) => {
    const {results, next} = await candidates.list(query);
    const nestedMoviesPromise = movies.batchRetrieve(
      results.map(({movieId}) => ({id: movieId})),
    );
    const nestedUsersPromise = profiles.batchRetrieve(
      results.map(({profileId}) => ({id: profileId})),
    );
    const [nestedMovies, nestedUsers] = await Promise.all([nestedMoviesPromise, nestedUsersPromise]);
    return {
      next,
      results: results.map((item, index) => ({
        ...item,
        movie: nestedMovies[index],
        profile: nestedUsers[index],
      })),
    };
  },
  createPollCandidate: async (input, {candidates, movies, profiles}, {auth}) => {
    const now = new Date();
    const [profile, movie, candidate] = await Promise.all([
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
      movies.retrieve({id: input.movieId}),
      candidates.create({
        ...input,
        version: identifier(now),
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return new Created({
      ...candidate, profile, movie,
    });
  },
  destroyPollCandidate: async (query, {candidates}) => candidates.destroy(query),
  listPollParticipants: async (query, {participants, profiles}) => {
    const {results, next} = await participants.list(query);
    const nestedUsers = await profiles.batchRetrieve(
      results.map(({profileId: id}) => ({id})),
    );
    return {
      next,
      results: results.map((item, index) => ({
        ...item,
        profile: nestedUsers[index],
      })),
    };
  },
  createPollParticipant: async (input, {participants, profiles}, {auth}) => {
    const now = new Date();
    const [profile, participant] = await Promise.all([
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
      participants.write({
        ...input,
        version: identifier(now),
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return new Created({
      ...participant, profile,
    });
  },
  destroyPollParticipant: async (query, {participants}) => participants.destroy(query),
  listPollVotes: async (query, {votes, profiles}) => {
    const {results, next} = await votes.list(query);
    const nestedProfiles = await profiles.batchRetrieve(
      results.map(({profileId}) => ({id: profileId})),
    );
    return {
      next,
      results: results.map((item, index) => ({
        ...item,
        profile: nestedProfiles[index],
      })),
    };
  },
  createPollVote: async ({value, ...input}, {votes, movies, profiles}, {auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [profile] = await Promise.all([
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
      // Also ensure that the movie exists
      movies.retrieve({id: input.movieId}),
    ]);
    const version = identifier(now);
    const vote = await votes.upsert({
      ...input,
      profileId, value, version,
      createdAt: now,
      updatedAt: now,
    }, {
      value, version, updatedAt: now,
    });
    if (vote.createdAt === now) {
      return new Created({ ...vote, profile });
    }
    return new OK({ ...vote, profile });
  },
  listUserRatings: async ({profileId, ordering, since, direction}, {ratings, movies}) => {
    const {results, next} = await ratings.list({ profileId, ordering, since, direction });
    const nestedMovies = await movies.batchRetrieve(
      results.map(({ movieId }) => ({ id: movieId })),
    );
    return {
      next,
      results: results.map((item, index) => ({
        ...item,
        movie: nestedMovies[index],
      })),
    };
  },
  createUserRating: async (input, {ratings, movies}) => {
    // Ensure that the movie exists
    const movie = await movies.retrieve({id: input.movieId});
    const now = new Date();
    const rating = await ratings.create({
      ...input,
      version: identifier(now),
      createdAt: now,
      updatedAt: now,
    });
    return new Created({ ...rating, movie });
  },
  destroyUserRating: async (query, {ratings}) => ratings.destroy(query),
  uploadUserRatings: async ({file, profileId}, {ratings, movies}, {auth, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const rawRatings = parseImdbRatingsCsv(file.data);
    const imdbIdChunks = chunkify(rawRatings.map((rating) => rating.id), 10);
    const movieChunks = flatMapAsync(imdbIdChunks, (imdbIds) => movies.scan({
      imdbId: imdbIds,
      ordering: 'imdbId',
      direction: 'asc',
    }));
    const existingMovies = await toFlattenArray(movieChunks);
    const moviesByImdbId = buildObject(existingMovies, (movie) => [movie.imdbId as string, movie]);
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
        await movies.upsert(movie, { ...movieUpdate, version: identifier() });
        // tslint:disable-next-line:no-console
        console.log(`Inserted/updated details about a ${movie.type} ${movie.originalTitle} (#${movie.id})`);
      }
      movieId = movie.id;
      const { value } = rawRating;
      const updatedAt = rawRating.modified || rawRating.created;
      // Insert the rating or update the existing rating
      const existingRating = await catchNotFound(ratings.retrieve({ profileId, movieId }));
      const version = identifier();
      if (!existingRating) {
        // Create a new rating
        yield await ratings.create({
          version,
          createdAt: updatedAt,
          updatedAt,
          movieId,
          profileId,
          value,
        });
        // tslint:disable-next-line:no-console
        console.log(`Created a new rating for the ${movie.type} ${movieId} of user ${profileId} with value ${value}`);
      } else if (updatedAt > existingRating.updatedAt) {
        yield await ratings.update({ movieId, profileId }, { version, value, updatedAt });
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
  listPollRatings: async ({pollId, ordering, direction, since}, models) => {
    const [profileIds, movieIds] = await Promise.all([
      toArray(flatMapAsync(
        models.participants.scan({ pollId, ordering: 'createdAt', direction: 'asc' }),
        (items) => items.map(({profileId}) => profileId),
      )),
      toArray(flatMapAsync(
        models.candidates.scan({ pollId, ordering: 'createdAt', direction: 'asc' }),
        (items) => items.map(({movieId}) => movieId),
      )),
    ]);
    const [{ results, next }, profiles] = await Promise.all([
      models.ratings.list({
        profileId: profileIds,
        movieId: movieIds,
        ordering, direction, since,
      }),
      models.profiles.batchRetrieve(profileIds.map((id) => ({id}))),
    ]);
    const publicProfiles = profiles
      .filter(isNotNully)
      .map(({id, name, picture}) => ({id, name, picture}))
    ;
    return {
      results: results.map((rating) => ({
        pollId,
        profile: publicProfiles.find(({id}) => rating.profileId === id) || null,
        ...rating,
      })),
      next: next && {
        since: next.since,
        pollId, ordering, direction,
      },
    };
  },
  createPollRating: async ({pollId, movieId, value}, {ratings, candidates, participants, profiles}, {auth}) => {
    const now = new Date();
    const profileId = auth.id;
    // Ensure that the candidate & participant exists
    await Promise.all([
      candidates.retrieve({ pollId, movieId }),
      participants.retrieve({ pollId, profileId }),
      profiles.write({ ...auth, version: identifier(now) }),
    ]);
    const rating = await ratings.write({
      movieId, profileId,
      version: identifier(now),
      value,
      createdAt: now,
      updatedAt: now,
    });
    return new Created({
      pollId,
      profile: { id: auth.id, name: auth.name, picture: auth.picture },
      ...rating,
    });
  },
  destroyPollCandidateRating: async ({pollId, movieId, profileId}, {candidates, participants, ratings}) => {
    // Ensure that candidate and participant exists
    await Promise.all([
      candidates.retrieve({pollId, movieId}),
      participants.retrieve({pollId, profileId}),
    ]);
    await ratings.destroy({profileId, movieId});
  },
  updatePollVote: async ({value, ...input}, {votes, movies, profiles}, {auth}) => {
    // Find the related resources, ensuring that they exist
    const now = new Date();
    const [profile, movie] = await Promise.all([
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
      movies.retrieve({id: input.movieId}),
    ]);
    // Vote already exists -> update it
    return new OK({
      ...await votes.update({...input}, {
        value,
        version: identifier(now),
        updatedAt: now,
      }),
      profile, movie,
    });
  },
  destroyPollVote: async (query, {votes}) => votes.destroy(query),
  retrieveMovie: async ({id}, {movies}, {environment}) => {
    const apiKey = environment.TMDBApiKey;
    const movie = await retrieveMovie(id, apiKey);
    // TODO: Do not overwrite the creation date
    return await movies.write(movie);
  },
  searchMovies: async ({ordering, since, direction, query}, {}, {environment}) => {
    const apiKey = environment.TMDBApiKey;
    const items = await searchMovies(query, apiKey);
    // Limit the number of search results for throttling the TMDb API usage
    return {
      results: order(items.slice(0, 6), ordering, direction, since),
      next: null,
    };
  },
});
