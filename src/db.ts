import { table } from 'broilerkit/db';
import { candidate, movie, participant, poll, profile, rating, vote } from './resources';

export const profiles = table(profile, 'Profiles')
  .index('name')
;
export const movies = table(movie, 'Movies')
  .migrate({ type: 'movie' })
  .index('title')
;
export const polls = table(poll, 'Polls')
  .index('profileId', 'createdAt')
;
export const candidates = table(candidate, 'Candidates')
  .index('pollId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('profileId', 'createdAt')
;
export const participants = table(participant, 'Participants')
  .index('profileId', 'createdAt')
  .index('pollId', 'createdAt')
;
export const votes = table(vote, 'Votes')
  .index('pollId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('profileId', 'createdAt')
;
export const ratings = table(rating, 'Ratings')
  .index('profileId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('movieId', 'profileId', 'createdAt')
;
