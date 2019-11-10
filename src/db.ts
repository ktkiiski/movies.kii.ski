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
  .migrate({
    candidateCount: 0,
    participantCount: 0,
    voteCount: 0,
  })
;
export const candidates = table(candidate, 'candidates')
  .index('pollId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('profileId', 'createdAt')
  .aggregate(polls).count('candidateCount', { id: 'pollId' })
;
export const participants = table(participant, 'participants')
  .index('profileId', 'createdAt')
  .index('pollId', 'createdAt')
  .aggregate(polls).count('participantCount', { id: 'pollId' })
  .migrate({
    voteCount: 0,
    positiveVoteCount: 0,
    neutralVoteCount: 0,
    negativeVoteCount: 0,
  })
;
export const votes = table(vote, 'votes')
  .index('pollId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('profileId', 'createdAt')
  .aggregate(polls).count(
    'voteCount', { id: 'pollId' },
  )
  .aggregate(participants).count(
    'voteCount', { pollId: 'pollId', profileId: 'profileId' },
  )
  .aggregate(participants).count(
    'positiveVoteCount',
    { pollId: 'pollId', profileId: 'profileId' },
    { value: 1 },
  )
  .aggregate(participants).count(
    'neutralVoteCount',
    { pollId: 'pollId', profileId: 'profileId' },
    { value: 0 },
  )
  .aggregate(participants).count(
    'negativeVoteCount',
    { pollId: 'pollId', profileId: 'profileId' },
    { value: -1 },
  )
;
export const ratings = table(rating, 'ratings')
  .index('profileId', 'createdAt')
  .index('movieId', 'createdAt')
  .index('movieId', 'profileId', 'createdAt')
;
