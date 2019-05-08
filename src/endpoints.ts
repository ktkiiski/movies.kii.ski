import { Created, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implementAll } from 'broilerkit/server';
import { order } from 'broilerkit/utils/arrays';
import * as api from './api';
import * as db from './db';
import { retrieveMovie, searchMovies } from './tmdb';

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
        const id = {...input, profileId};
        const alreadyExists = new Error(`Already exists`);
        try {
            // Attempt to create the vote if already exists
            return new Created({
                ...await votes.create({
                    ...input,
                    ...id,
                    value, version,
                    updatedAt: now,
                    createdAt: now,
                }, alreadyExists),
                profile,
            });
        } catch (error) {
            if (error === alreadyExists) {
                // Vote already exists -> update it
                return new OK({
                    ...await votes.update(id, {
                        value, version, updatedAt: now,
                    }),
                    profile,
                });
            }
            // Raise through
            throw error;
        }
    },
    listUserRatings: async ({profileId, ordering, since, direction}, {ratings}) => (
        ratings.list({ profileId, ordering, since, direction })
    ),
    createUserRating: async (input, {ratings, movies}) => {
        // Ensure that the movie exists
        await movies.retrieve({id: input.movieId});
        const now = new Date();
        const rating = await ratings.create({
            ...input,
            version: identifier(now),
            createdAt: now,
            updatedAt: now,
        });
        return new Created(rating);
    },
    destroyUserRating: async (query, {ratings}) => ratings.destroy(query),
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
