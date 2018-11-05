import { table } from 'broilerkit/db';
import { candidate, movie, poll, profile, rating, vote } from './resources';

export const profiles = table(profile, {
    name: 'Profiles',
    identifyBy: ['id'],
    versionBy: 'version',
});

export const movies = table(movie, {
    name: 'Movies',
    identifyBy: ['id'],
    versionBy: 'version',
});

export const polls = table(poll, {
    name: 'Polls',
    identifyBy: ['id'],
    versionBy: 'version',
});

export const candidates = table(candidate, {
    name: 'Candidates',
    identifyBy: ['pollId', 'movieId'],
    versionBy: 'version',
});

export const votes = table(vote, {
    name: 'Votes',
    identifyBy: ['pollId', 'profileId', 'movieId'],
    versionBy: 'version',
});

export const ratings = table(rating, {
    name: 'Ratings',
    identifyBy: ['profileId', 'movieId'],
    versionBy: 'version',
});
