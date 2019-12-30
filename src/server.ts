import { chunkify, flatMapAsync, flatMapAsyncParallel, toArray, toFlattenArray } from 'broilerkit/async';
import { count, create, destroy, list, retrieve, scan, update, upsert, write } from 'broilerkit/db';
import { catchNotFound } from 'broilerkit/errors';
import { Created, HttpStatus, isResponse, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import { order } from 'broilerkit/utils/arrays';
import { buildObject } from 'broilerkit/utils/objects';
import * as api from './api';
import { parseImdbRatingsCsv } from './imdb';
import { candidates, movies, participants, pollCandidates, pollParticipants, pollRatings, polls, pollVotes, profiles, ratings, userRatings, votes } from './resources';
import { retrieveMovie, retrieveMovieByImdbId, searchMovies } from './tmdb';

export default implementAll(api).using({
  listUserPolls: async (query, {db}) => db.run(list(polls, query)),
  createUserPoll: async (input, {db, auth}) => {
    const now = new Date();
    const [poll] = await db.batch([
      create(polls, {
        ...input,
        id: identifier(now),
        version: identifier(now),
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
        candidateCount: 0,
        participantCount: 0,
        voteCount: 0,
      }),
      write(profiles, {
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new Created(poll);
  },
  retrieveUserPoll: async (query, {db}) => db.run(retrieve(polls, query)),
  updateUserPoll: async ({id, ...changes}, {db, auth}) => {
    const now = new Date();
    const [poll] = await db.batch([
      update(polls, {id}, {
        ...changes,
        version: identifier(now),
        updatedAt: now,
      }),
      write(profiles, {
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new OK(poll);
  },
  destroyUserPoll: async (query, {db}) => db.run(destroy(polls, query)),
  retrievePoll: async (query, {db}) => db.run(retrieve(polls, query)),
  listPollCandidates: async (query, {db}) => db.run(list(pollCandidates, query)),
  createPollCandidate: async (input, {db, auth}) => {
    const now = new Date();
    const [profile, movie, candidate] = await db.batch([
      write(profiles, {
        ...auth,
        version: identifier(now),
      }),
      retrieve(movies, {id: input.movieId}),
      create(candidates, {
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
  destroyPollCandidate: async (query, {db}) => db.run(destroy(candidates, query)),
  listPollParticipants: async (query, {db}) => db.run(list(pollParticipants, query)),
  createPollParticipant: async ({ pollId }, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [
      voteCount,
      positiveVoteCount,
      neutralVoteCount,
      negativeVoteCount,
    ] = await db.batch([
      count(votes, { pollId, profileId }),
      count(votes, { pollId, profileId, value: 1 }),
      count(votes, { pollId, profileId, value: 0 }),
      count(votes, { pollId, profileId, value: -1 }),
    ]);
    const [profile, participant] = await db.batch([
      upsert(profiles, {
        ...auth,
        version: identifier(now),
      }, {
        version: identifier(now),
      }),
      upsert(participants, {
        pollId,
        version: identifier(now),
        profileId,
        createdAt: now,
        updatedAt: now,
        voteCount,
        positiveVoteCount,
        neutralVoteCount,
        negativeVoteCount,
      }, {
        version: identifier(now),
        updatedAt: now,
      }),
    ]);
    return new Created({
      ...participant, profile,
    });
  },
  destroyPollParticipant: async (query, {db}) => db.run(destroy(participants, query)),
  listPollVotes: async (query, {db}) => db.run(list(pollVotes, query)),
  createPollVote: async ({value, ...input}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [profile, movie] = await db.batch([
      write(profiles, { ...auth, version: identifier(now) }),
      // Also ensure that the movie exists
      retrieve(movies, {id: input.movieId}),
    ]);
    const version = identifier(now);
    const vote = await db.run(upsert(votes, {
      ...input,
      profileId, value, version,
      createdAt: now,
      updatedAt: now,
    }, {
      value, version, updatedAt: now,
    }));
    if (vote.createdAt === now) {
      return new Created({ ...vote, profile, movie });
    }
    return new OK({ ...vote, profile, movie });
  },
  listUserRatings: async ({profileId, ordering, since, direction}, {db}) => (
    db.run(list(userRatings, { profileId, ordering, since, direction }))
  ),
  createUserRating: async (input, {db}) => {
    // Ensure that the movie exists
    const movie = await db.run(retrieve(movies, { id: input.movieId }));
    const now = new Date();
    const rating = await db.run(create(ratings, {
      ...input,
      version: identifier(now),
      createdAt: now,
      updatedAt: now,
    }));
    return new Created({ ...rating, movie });
  },
  destroyUserRating: async (query, {db}) => db.run(destroy(ratings, query)),
  uploadUserRatings: async ({file, profileId}, {db, auth, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const rawRatings = parseImdbRatingsCsv(file.data);
    const imdbIdChunks = chunkify(rawRatings.map((rating) => rating.id), 10);
    const movieChunks = flatMapAsync(imdbIdChunks, (imdbIds) => db.scan(scan(movies, {
      imdbId: imdbIds,
      ordering: 'imdbId',
      direction: 'asc',
    })));
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
        await db.run(upsert(movies, movie, { ...movieUpdate, version: identifier() }));
        // tslint:disable-next-line:no-console
        console.log(`Inserted/updated details about a ${movie.type} ${movie.originalTitle} (#${movie.id})`);
      }
      movieId = movie.id;
      const { value } = rawRating;
      const updatedAt = rawRating.modified || rawRating.created;
      // Insert the rating or update the existing rating
      const existingRating = await catchNotFound(
        db.run(retrieve(ratings, { profileId, movieId })),
      );
      const version = identifier();
      if (!existingRating) {
        // Create a new rating
        yield await db.run(create(ratings, {
          version,
          createdAt: updatedAt,
          updatedAt,
          movieId,
          profileId,
          value,
        }));
        // tslint:disable-next-line:no-console
        console.log(`Created a new rating for the ${movie.type} ${movieId} of user ${profileId} with value ${value}`);
      } else if (updatedAt > existingRating.updatedAt) {
        yield await db.run(update(ratings, { movieId, profileId }, { version, value, updatedAt }));
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
  listPollRatings: async (query, {db}) => {
    return db.run(list(pollRatings, query));
  },
  createPollRating: async ({pollId, movieId, value}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    // Ensure that the movie, candidate & participant exists
    const [movie] = await db.batch([
      retrieve(movies, { id: movieId }),
      retrieve(candidates, { pollId, movieId }),
      retrieve(participants, { pollId, profileId }),
      write(profiles, { ...auth, version: identifier(now) }),
    ]);
    const rating = await db.run(write(ratings, {
      movieId, profileId,
      version: identifier(now),
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
      retrieve(candidates, { pollId, movieId }),
      retrieve(participants, { pollId, profileId }),
      destroy(ratings, {profileId, movieId}),
    ]);
  },
  updatePollVote: async ({value, ...input}, {db, auth}) => {
    // Find the related resources, ensuring that they exist
    const now = new Date();
    const [profile, movie] = await db.batch([
      write(profiles, {
        ...auth,
        version: identifier(now),
      }),
      retrieve(movies, {id: input.movieId}),
    ]);
    // Vote already exists -> update it
    return new OK({
      ...await db.run(update(votes, {...input}, {
        value,
        version: identifier(now),
        updatedAt: now,
      })),
      profile, movie,
    });
  },
  destroyPollVote: async (query, {db}) => db.run(destroy(votes, query)),
  retrieveMovie: async ({id}, {db, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const movie = await retrieveMovie(id, apiKey);
    // TODO: Do not overwrite the creation date
    return await db.run(write(movies, movie));
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
