import { create, destroy, initiate, retrieve, update, upsert, write } from 'broilerkit/db';
import { Created, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import order from 'immuton/order';
import * as api from './api';
import { ratingsBucket } from './buckets';
import { Candidate, Movie, Participant, Poll, PollCandidate, PollParticipant, PollRating, PollVote, Profile, Rating, UserRating, Vote } from './resources';
import { retrieveMovie, searchMovies } from './tmdb';

export default implementAll(api).using({
  createUserPoll: async (input, {db, auth}) => {
    const now = new Date();
    const id = identifier(now);
    const [, poll] = await db.batch([
      write(Profile, {
        ...auth,
      }),
      create(Poll, {
        ...input,
        id,
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
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
    const [, , candidate] = await db.batch([
      write(Profile, auth),
      retrieve(Movie, {id: input.movieId}),
      create(PollCandidate, {
        ...input,
        profileId: auth.id,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return new Created(candidate);
  },
  destroyPollCandidate: async (query, {db}) => db.run(destroy(Candidate, query)),
  createPollParticipant: async ({ pollId }, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [, participant] = await db.batch([
      write(Profile, auth),
      upsert(PollParticipant, {
        pollId,
        profileId,
        createdAt: now,
        updatedAt: now,
      }, {
        updatedAt: now,
      }),
    ]);
    return new Created(participant);
  },
  destroyPollParticipant: async (query, {db}) => db.run(destroy(Participant, query)),
  createPollVote: async ({value, pollId, movieId}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    const [, , , vote] = await db.batch([
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
      upsert(PollVote, {
        pollId, movieId,
        profileId, value,
        createdAt: now,
        updatedAt: now,
      }, {
        value, updatedAt: now,
      }),
    ]);
    if (vote.createdAt === now) {
      return new Created(vote);
    }
    return new OK(vote);
  },
  createUserRating: async (input, {db}) => {
    // Ensure that the movie exists
    const now = new Date();
    const [, rating] = await db.batch([
      retrieve(Movie, { id: input.movieId }),
      create(UserRating, {
        ...input,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return new Created(rating);
  },
  destroyUserRating: async (query, {db}) => db.run(destroy(Rating, query)),
  createRatingUpload: async ({ profileId }, { auth, storage }) => {
    const form = await storage.allowUpload(ratingsBucket, {
      access: 'private',
      userId: profileId,
      contentType: 'text/csv',
      maxSize: 10 * 1024 * 1024, // 10 MB
      expiresIn: 30 * 60 * 1000, // 30 min
    });
    const now = new Date();
    return new Created({
      id: identifier(now),
      createdAt: now,
      profileId: auth.id,
      form,
    });
  },
  createPollRating: async ({pollId, movieId, value}, {db, auth}) => {
    const now = new Date();
    const profileId = auth.id;
    // Ensure that the movie, candidate & participant exists
    const [, , , , pollRating] = await db.batch([
      retrieve(Movie, { id: movieId }),
      retrieve(Candidate, { pollId, movieId }),
      retrieve(Participant, { pollId, profileId }),
      write(Profile, auth),
      write(PollRating, {
        pollId,
        movieId,
        profileId,
        value,
        createdAt: now,
        updatedAt: now,
      }),
    ]);
    return new Created(pollRating);
  },
  destroyPollCandidateRating: async ({pollId, movieId, profileId}, {db}) => {
    // Ensure that candidate and participant exists
    await db.run(destroy(PollRating, { pollId, profileId, movieId }));
  },
  updatePollVote: async ({value, profileId, pollId, movieId}, {db, auth}) => {
    // Find the related resources, ensuring that they exist
    const now = new Date();
    const [, , vote] = await db.batch([
      // Ensure that the user profile is up-to-date
      write(Profile, auth),
      // Ensure that the user is a participant of the poll
      initiate(Participant, {
        pollId, profileId,
        createdAt: now, updatedAt: now,
      }),
      // Upsert the vote
      update(PollVote, { profileId, pollId, movieId }, {
        value,
        updatedAt: now,
      }),
    ]);
    // Vote already exists -> update it
    return new OK(vote);
  },
  destroyPollVote: async (query, {db}) => {
    db.run(destroy(Vote, query));
  },
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
