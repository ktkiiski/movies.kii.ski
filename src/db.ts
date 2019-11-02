import { table } from 'broilerkit/db';
import { candidate, movie, participant, poll, profile, rating, vote } from './resources';

export const profiles = table(profile, 'profiles')
  .index('name')
;
export const movies = table(movie, 'movies')
  .migrate({ type: 'movie' })
  .index('title')
;
export const polls = table(poll, 'polls')
  .index('profileId', 'createdAt')
;
export const candidates = table(candidate, 'candidates')
  .index('pollId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('profileId', 'createdAt')
;
export const participants = table(participant, 'participants')
  .index('profileId', 'createdAt')
  .index('pollId', 'createdAt')
;
export const votes = table(vote, 'votes')
  .index('pollId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('profileId', 'createdAt')
;
export const ratings = table(rating, 'ratings')
  .index('profileId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('movieId', 'profileId', 'createdAt')
;
