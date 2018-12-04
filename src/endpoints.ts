import { Created, OK } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { implement } from 'broilerkit/server';
import { order } from 'broilerkit/utils/arrays';
import * as api from './api';
import * as db from './db';
import { retrieveMovie, searchMovies } from './tmdb';

export const userPollCollection = implement(api.userPollCollection, db)
    .list(async (query, {polls}) => {
        return await polls.list(query);
    })
    .create(async (input, {polls, profiles}, {auth}) => {
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
    })
;

export const userPollResource = implement(api.userPollResource, db)
    .retrieve(async ({id}, {polls}) => {
        return await polls.retrieve({id});
    })
    .update(async ({id, ...changes}, {polls, profiles}, {auth}) => {
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
    })
    .destroy(async ({id}, {polls}) => {
        await polls.destroy({id});
    })
;

export const pollResource = implement(api.pollResource, db)
    .retrieve(async ({id}, {polls}) => {
        return await polls.retrieve({id});
    })
;

export const pollCandidateCollection = implement(api.pollCandidateCollection, db)
    .list(async (query, {candidates, movies, profiles}) => {
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
    })
    .create(async (input, {candidates, movies, profiles}, {auth}) => {
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
    })
;

export const pollCandidateResource = implement(api.pollCandidateResource, db)
    .destroy(async (query, {candidates}) => {
        await candidates.destroy(query);
    })
;

export const pollVoteCollection = implement(api.pollVoteCollection, db)
    .list(async (query, {votes, profiles}) => {
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
    })
    .create(async ({value, ...input}, {votes, movies, profiles}, {auth}) => {
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
    })
;

export const userRatingCollection = implement(api.userRatingCollection, db)
    .list(async ({profileId, ordering, since, direction}, {ratings}) => {
        return ratings.list({
            profileId, ordering, since, direction,
        });
    })
    .create(async (input, {ratings, movies}) => {
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
    })
;

export const userRatingResource = implement(api.userRatingResource, db)
    .destroy(async (query, {ratings}) => {
        await ratings.destroy(query);
    })
;

export const pollVoteResource = implement(api.pollVoteResource, db)
    .update(async ({value, ...input}, {votes, movies, profiles}, {auth}) => {
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
    })
    .destroy(async (query, {votes}) => {
        await votes.destroy(query);
    })
;
export const movieResource = implement(api.movieResource, db)
    .retrieve(async ({id}, {movies}, {environment}) => {
        const apiKey = environment.TMDBApiKey;
        const movie = await retrieveMovie(id, apiKey);
        return await movies.write(movie);
    })
;

export const queryMovieSearchResultCollection = implement(api.queryMovieSearchResultCollection, db)
    .list(async ({ordering, since, direction, query}, {}, {environment}) => {
        const apiKey = environment.TMDBApiKey;
        const items = await searchMovies(query, apiKey);
        // Limit the number of search results for throttling the TMDb API usage
        return {
            results: order(items.slice(0, 6), ordering, direction, since),
            next: null,
        };
    })
;
