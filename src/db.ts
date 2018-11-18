import { table } from 'broilerkit/db';
import { candidate, movie, poll, profile, rating, vote } from './resources';

export const profiles = table(profile, {
    name: 'Profiles',
});

export const movies = table(movie, {
    name: 'Movies',
});

export const polls = table(poll, {
    name: 'Polls',
});

export const candidates = table(candidate, {
    name: 'Candidates',
});

export const votes = table(vote, {
    name: 'Votes',
});

export const ratings = table(rating, {
    name: 'Ratings',
});
