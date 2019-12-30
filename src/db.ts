import { database } from 'broilerkit/db';
import { candidates, movies, participants, polls, profiles, ratings, votes } from './resources';

const db = database();

db.addTable(profiles, {
  indexes: [
    ['name'],
  ],
});
db.addTable(movies, {
  migrate: { type: 'movie' },
  indexes: [
    ['title'],
  ],
});
db.addTable(polls, {
  indexes: [
    ['profileId', 'createdAt'],
  ],
  migrate: {
    candidateCount: 0,
    participantCount: 0,
    voteCount: 0,
  },
});
db.addTable(candidates, {
  indexes: [
    ['pollId', 'createdAt'],
    ['movieId', 'createdAt'],
    ['profileId', 'createdAt'],
  ],
});
db.aggregateCount(candidates, polls, 'candidateCount', { id: 'pollId' });
db.addTable(participants, {
  indexes: [
    ['profileId', 'createdAt'],
    ['pollId', 'createdAt'],
  ],
  migrate: {
    voteCount: 0,
    positiveVoteCount: 0,
    neutralVoteCount: 0,
    negativeVoteCount: 0,
  },
});
db.aggregateCount(participants, polls, 'participantCount', { id: 'pollId' });
db.addTable(votes, {
  indexes: [
    ['pollId', 'createdAt'],
    ['movieId', 'createdAt'],
    ['profileId', 'createdAt'],
  ],
});
db.aggregateCount(votes, polls, 'voteCount', { id: 'pollId' });
db.aggregateCount(votes, participants, 'voteCount', { pollId: 'pollId', profileId: 'profileId' });
db.aggregateCount(votes, participants, 'positiveVoteCount', { pollId: 'pollId', profileId: 'profileId' }, { value: 1 });
db.aggregateCount(votes, participants, 'neutralVoteCount', { pollId: 'pollId', profileId: 'profileId' }, { value: 0 });
db.aggregateCount(votes, participants, 'negativeVoteCount', { pollId: 'pollId', profileId: 'profileId' }, { value: -1 });
db.addTable(ratings, {
  indexes: [
    ['profileId', 'createdAt'],
    ['movieId', 'createdAt'],
    ['movieId', 'profileId', 'createdAt'],
  ],
});

export default db;
