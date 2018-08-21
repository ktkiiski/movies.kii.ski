import { table } from 'broilerkit/db';
import { candidate, movie, poll, profile, rating, vote } from './resources';

export const profiles = table('Profiles')
    .resource(profile)
    .identifyBy('id')
    .versionBy('version')
;

export const movies = table('Movies')
    .resource(movie)
    .identifyBy('id')
    .versionBy('version')
;

export const polls = table('Polls')
    .resource(poll)
    .identifyBy('id')
    .versionBy('version')
;

export const candidates = table('Candidates')
    .resource(candidate)
    .identifyBy('pollId', 'movieId')
    .versionBy('version')
;

export const votes = table('Votes')
    .resource(vote)
    .identifyBy('pollId', 'profileId', 'movieId')
    .versionBy('version')
;

export const ratings = table('Ratings')
    .resource(rating)
    .identifyBy('profileId', 'movieId')
    .versionBy('version')
;
