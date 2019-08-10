import { table } from 'broilerkit/db';
import { candidate, movie, participant, poll, profile, rating, vote } from './resources';

export const profiles = table(profile, {
  name: 'Profiles',
});
export const movies = table(movie, {
  name: 'Movies',
  defaults: {
    type: 'movie',
  },
});
export const polls = table(poll, {
  name: 'Polls',
});
export const candidates = table(candidate, {
  name: 'Candidates',
});
export const participants = table(participant, {
  name: 'Participants',
});
export const votes = table(vote, {
  name: 'Votes',
});
export const ratings = table(rating, {
  name: 'Ratings',
});
