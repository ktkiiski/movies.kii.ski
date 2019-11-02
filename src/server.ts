import { chunkify, flatMapAsync, flatMapAsyncParallel, toArray, toFlattenArray } from 'broilerkit/async';
import { catchNotFound } from 'broilerkit/errors';
import { Created, HttpStatus, isResponse, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import { order } from 'broilerkit/utils/arrays';
import { isNotNully } from 'broilerkit/utils/compare';
import { buildObject } from 'broilerkit/utils/objects';
import * as api from './api';
import { candidates, movies, participants, polls, profiles, ratings, votes } from './db';
import { parseImdbRatingsCsv } from './imdb';
import { retrieveMovie, retrieveMovieByImdbId, searchMovies } from './tmdb';

export default implementAll(api).using({
  listUserPolls: async (query, {db}) => db.list(polls, query),
  createUserPoll: async (input, {db, auth}) => {
    const now = new Date();
    const [poll] = await Promise.all([
      db.create(polls, {
        ...input,
        id: identifier(now),
        version: identifier(now),
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
      db.write(profiles, {
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new Created(poll);
  },
  retrieveUserPoll: async ({id}, {db}) => db.retrieve(polls, {id}),
  updateUserPoll: async ({id, ...changes}, {db, auth}) => {
    const now = new Date();
    const [poll] = await Promise.all([
      db.update(polls, {id}, {
        ...changes,
        version: identifier(now),
        updatedAt: now,
      }),
      db.write(profiles, {
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new OK(poll);
  },
  destroyUserPoll: async ({id}, {db}) => db.destroy(polls, {id}),
  retrievePoll: async ({id}, {db}) => db.retrieve(polls, {id}),
  listPollCandidates: async (query, {db}) => {
    const {results, next} = await db.list(candidates, query);
    const nestedMoviesPromise = db.batchRetrieve(movies,
      results.map(({movieId}) => ({id: movieId})),
    );
    const nestedUsersPromise = db.batchRetrieve(profiles,
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
  createPollCandidate: async (input, {db, auth}) => {
    const now = new Date();
    const [profile, movie, candidate] = await Promise.all([
      db.write(profiles, {
        ...auth,
        version: identifier(now),
      }),
      db.retrieve(movies, {id: input.movieId}),
      db.create(candidates, {
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
  destroyPollCandidate: async (query, {db}) => db.destroy(candidates, query),
  listPollParticipants: async (query, {db}) => {
    const {results, next} = await db.list(participants, query);
    const nestedUsers = await db.batchRetrieve(profiles,
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
  createPollParticipant: async (input, {db, auth}) => {
    const now = new Date();
    const [profile, participant] = await Promise.all([
      db.write(profiles, {
        ...auth,
        version: identifier(now),
      }),
      db.write(participants, {
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
  destroyPollParticipant: async (query, {db}) => db.destroy(participants, query),
  listPollVotes: async (query, {db}) => {
    const {results, next} = await db.list(votes, query);
    const nestedProfiles = await db.batchRetrieve(profiles,
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
  createPollVote: async ({value, ...input}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [profile] = await Promise.all([
      db.write(profiles, {
        ...auth,
        version: identifier(now),
      }),
      // Also ensure that the movie exists
      db.retrieve(movies, {id: input.movieId}),
    ]);
    const version = identifier(now);
    const vote = await db.upsert(votes, {
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
  listUserRatings: async ({profileId, ordering, since, direction}, {db}) => {
    const {results, next} = await db.list(ratings, { profileId, ordering, since, direction });
    const nestedMovies = await db.batchRetrieve(movies,
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
  createUserRating: async (input, {db}) => {
    // Ensure that the movie exists
    const movie = await db.retrieve(movies, {id: input.movieId});
    const now = new Date();
    const rating = await db.create(ratings, {
      ...input,
      version: identifier(now),
      createdAt: now,
      updatedAt: now,
    });
    return new Created({ ...rating, movie });
  },
  destroyUserRating: async (query, {db}) => db.destroy(ratings, query),
  uploadUserRatings: async ({file, profileId}, {db, auth, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const rawRatings = parseImdbRatingsCsv(file.data);
    const imdbIdChunks = chunkify(rawRatings.map((rating) => rating.id), 10);
    const movieChunks = flatMapAsync(imdbIdChunks, (imdbIds) => db.scan(movies, {
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
        await db.upsert(movies, movie, { ...movieUpdate, version: identifier() });
        // tslint:disable-next-line:no-console
        console.log(`Inserted/updated details about a ${movie.type} ${movie.originalTitle} (#${movie.id})`);
      }
      movieId = movie.id;
      const { value } = rawRating;
      const updatedAt = rawRating.modified || rawRating.created;
      // Insert the rating or update the existing rating
      const existingRating = await catchNotFound(db.retrieve(ratings, { profileId, movieId }));
      const version = identifier();
      if (!existingRating) {
        // Create a new rating
        yield await db.create(ratings, {
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
        yield await db.update(ratings, { movieId, profileId }, { version, value, updatedAt });
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
  listPollRatings: async ({pollId, ordering, direction, since}, {db}) => {
    const [profileIds, movieIds] = await Promise.all([
      toArray(flatMapAsync(
        db.scan(participants, { pollId, ordering: 'createdAt', direction: 'asc' }),
        (items) => items.map(({profileId}) => profileId),
      )),
      toArray(flatMapAsync(
        db.scan(candidates, { pollId, ordering: 'createdAt', direction: 'asc' }),
        (items) => items.map(({movieId}) => movieId),
      )),
    ]);
    const [{ results, next }, pollProfiles] = await Promise.all([
      db.list(ratings, {
        profileId: profileIds,
        movieId: movieIds,
        ordering, direction, since,
      }),
      db.batchRetrieve(profiles, profileIds.map((id) => ({id}))),
    ]);
    const publicProfiles = pollProfiles
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
  createPollRating: async ({pollId, movieId, value}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    // Ensure that the candidate & participant exists
    await Promise.all([
      db.retrieve(candidates, { pollId, movieId }),
      db.retrieve(participants, { pollId, profileId }),
      db.write(profiles, { ...auth, version: identifier(now) }),
    ]);
    const rating = await db.write(ratings, {
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
  destroyPollCandidateRating: async ({pollId, movieId, profileId}, {db}) => {
    // Ensure that candidate and participant exists
    await Promise.all([
      db.retrieve(candidates, {pollId, movieId}),
      db.retrieve(participants, {pollId, profileId}),
    ]);
    await db.destroy(ratings, {profileId, movieId});
  },
  updatePollVote: async ({value, ...input}, {db, auth}) => {
    // Find the related resources, ensuring that they exist
    const now = new Date();
    const [profile, movie] = await Promise.all([
      db.write(profiles, {
        ...auth,
        version: identifier(now),
      }),
      db.retrieve(movies, {id: input.movieId}),
    ]);
    // Vote already exists -> update it
    return new OK({
      ...await db.update(votes, {...input}, {
        value,
        version: identifier(now),
        updatedAt: now,
      }),
      profile, movie,
    });
  },
  destroyPollVote: async (query, {db}) => db.destroy(votes, query),
  retrieveMovie: async ({id}, {db, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const movie = await retrieveMovie(id, apiKey);
    // TODO: Do not overwrite the creation date
    return await db.write(movies, movie);
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
