import { chunkify, flatMapAsync, flatMapAsyncParallel, toArray, toFlattenArray } from 'broilerkit/async';
import { catchNotFound } from 'broilerkit/errors';
import { Created, HttpStatus, isResponse, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import { order } from 'broilerkit/utils/arrays';
import { buildObject } from 'broilerkit/utils/objects';
import * as api from './api';
import { candidates, movies, participants, polls, profiles, ratings, votes } from './db';
import { parseImdbRatingsCsv } from './imdb';
import { retrieveMovie, retrieveMovieByImdbId, searchMovies } from './tmdb';

const publicProfiles = profiles.pick(['id', 'name', 'picture']);

export default implementAll(api).using({
  listUserPolls: async (query, {db}) => db.run(polls.list(query)),
  createUserPoll: async (input, {db, auth}) => {
    const now = new Date();
    const [poll] = await db.batch([
      polls.create({
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
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
    ]);
    return new Created(poll);
  },
  retrieveUserPoll: async ({id}, {db}) => db.run(polls.retrieve({id})),
  updateUserPoll: async ({id, ...changes}, {db, auth}) => {
    const now = new Date();
    const [poll] = await db.batch([
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
  destroyUserPoll: async ({id}, {db}) => db.run(polls.destroy({id})),
  retrievePoll: async ({id}, {db}) => db.run(polls.retrieve({id})),
  listPollCandidates: async (query, {db}) => db.run(candidates
    .nest('movie', movies, { id: 'movieId' })
    .nest('profile', publicProfiles, { id: 'profileId' })
    .list(query)),
  createPollCandidate: async (input, {db, auth}) => {
    const now = new Date();
    const [profile, movie, candidate] = await db.batch([
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
  destroyPollCandidate: async (query, {db}) => db.run(candidates.destroy(query)),
  listPollParticipants: async (query, {db}) => db.run(participants
    .nest('profile', publicProfiles, { id: 'profileId' })
    .list(query)),
  createPollParticipant: async ({ pollId }, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [
      voteCount,
      positiveVoteCount,
      neutralVoteCount,
      negativeVoteCount,
    ] = await db.runAll([
      votes.count({ pollId, profileId }),
      votes.count({ pollId, profileId, value: 1 }),
      votes.count({ pollId, profileId, value: 0 }),
      votes.count({ pollId, profileId, value: -1 }),
    ]);
    const [profile, participant] = await db.batch([
      profiles.upsert({
        ...auth,
        version: identifier(now),
      }, {
        version: identifier(now),
      }),
      participants.upsert({
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
  destroyPollParticipant: async (query, {db}) => db.run(participants.destroy(query)),
  listPollVotes: async (query, {db}) => db.run(votes
    .nest('profile', publicProfiles, {id: 'profileId'})
    .list(query)),
  createPollVote: async ({value, ...input}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [profile] = await db.batch([
      profiles.write({ ...auth, version: identifier(now) }),
      // Also ensure that the movie exists
      movies.retrieve({id: input.movieId}),
    ]);
    const version = identifier(now);
    const vote = await db.run(votes.upsert({
      ...input,
      profileId, value, version,
      createdAt: now,
      updatedAt: now,
    }, {
      value, version, updatedAt: now,
    }));
    if (vote.createdAt === now) {
      return new Created({ ...vote, profile });
    }
    return new OK({ ...vote, profile });
  },
  listUserRatings: async ({profileId, ordering, since, direction}, {db}) => (
    db.run(ratings
      .nest('movie', movies, { id: 'movieId' })
      .list({ profileId, ordering, since, direction }))
  ),
  createUserRating: async (input, {db}) => {
    // Ensure that the movie exists
    const movie = await db.run(movies.retrieve({ id: input.movieId }));
    const now = new Date();
    const rating = await db.run(ratings.create({
      ...input,
      version: identifier(now),
      createdAt: now,
      updatedAt: now,
    }));
    return new Created({ ...rating, movie });
  },
  destroyUserRating: async (query, {db}) => db.run(ratings.destroy(query)),
  uploadUserRatings: async ({file, profileId}, {db, auth, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const rawRatings = parseImdbRatingsCsv(file.data);
    const imdbIdChunks = chunkify(rawRatings.map((rating) => rating.id), 10);
    const movieChunks = flatMapAsync(imdbIdChunks, (imdbIds) => db.scan(movies.scan({
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
        await db.run(movies.upsert(movie, { ...movieUpdate, version: identifier() }));
        // tslint:disable-next-line:no-console
        console.log(`Inserted/updated details about a ${movie.type} ${movie.originalTitle} (#${movie.id})`);
      }
      movieId = movie.id;
      const { value } = rawRating;
      const updatedAt = rawRating.modified || rawRating.created;
      // Insert the rating or update the existing rating
      const existingRating = await catchNotFound(
        db.run(ratings.retrieve({ profileId, movieId })),
      );
      const version = identifier();
      if (!existingRating) {
        // Create a new rating
        yield await db.run(ratings.create({
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
        yield await db.run(ratings.update({ movieId, profileId }, { version, value, updatedAt }));
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
    const pollCandidateRatings = ratings
      .join(participants, { profileId: 'profileId' }, { pollId: 'pollId' })
      .join(candidates, { pollId: 'pollId', movieId: 'movieId' }, {})
      .nest('profile', publicProfiles, { id: 'profileId' });
    return db.run(pollCandidateRatings.list({
      pollId, ordering, direction, since,
    }));
  },
  createPollRating: async ({pollId, movieId, value}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    // Ensure that the candidate & participant exists
    await db.batch([
      candidates.retrieve({ pollId, movieId }),
      participants.retrieve({ pollId, profileId }),
      profiles.write({ ...auth, version: identifier(now) }),
    ]);
    const rating = await db.run(ratings.write({
      movieId, profileId,
      version: identifier(now),
      value,
      createdAt: now,
      updatedAt: now,
    }));
    return new Created({
      pollId,
      profile: { id: auth.id, name: auth.name, picture: auth.picture },
      ...rating,
    });
  },
  destroyPollCandidateRating: async ({pollId, movieId, profileId}, {db}) => {
    // Ensure that candidate and participant exists
    await db.batch([
      candidates.retrieve({ pollId, movieId }),
      participants.retrieve({ pollId, profileId }),
      ratings.destroy({profileId, movieId}),
    ]);
  },
  updatePollVote: async ({value, ...input}, {db, auth}) => {
    // Find the related resources, ensuring that they exist
    const now = new Date();
    const [profile, movie] = await db.batch([
      profiles.write({
        ...auth,
        version: identifier(now),
      }),
      movies.retrieve({id: input.movieId}),
    ]);
    // Vote already exists -> update it
    return new OK({
      ...await db.run(votes.update({...input}, {
        value,
        version: identifier(now),
        updatedAt: now,
      })),
      profile, movie,
    });
  },
  destroyPollVote: async (query, {db}) => db.run(votes.destroy(query)),
  retrieveMovie: async ({id}, {db, environment}) => {
    const apiKey = environment.TMDBApiKey;
    const movie = await retrieveMovie(id, apiKey);
    // TODO: Do not overwrite the creation date
    return await db.run(movies.write(movie));
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
