import { database } from 'broilerkit/db';
import {
  BasePoll,
  Candidate,
  Movie,
  Participant,
  ParticipantVoteCounter,
  ParticipantVoteValueCounter,
  PollCandidateCounter,
  PollParticipantCounter,
  PollVoteCounter,
  Profile,
  Rating,
  Vote,
} from './resources';

const db = database();

db.addTable(Profile, {
  indexes: [['name']],
});
db.addTable(Movie, {
  migrate: { type: 'movie' },
  indexes: [['title']],
});
db.addTable(BasePoll, {
  indexes: [['profileId', 'createdAt']],
});
db.addTable(PollCandidateCounter);
db.addTable(PollParticipantCounter);
db.addTable(PollVoteCounter);
db.addTable(Candidate, {
  indexes: [
    ['pollId', 'createdAt'],
    ['movieId', 'createdAt'],
    ['profileId', 'createdAt'],
  ],
});
db.aggregateCount(Candidate, PollCandidateCounter, 'count', { pollId: 'pollId' });
db.addTable(Participant, {
  indexes: [
    ['profileId', 'createdAt'],
    ['pollId', 'createdAt'],
  ],
});
db.aggregateCount(Participant, PollParticipantCounter, 'count', { pollId: 'pollId' });
db.addTable(Vote, {
  indexes: [
    ['pollId', 'createdAt'],
    ['movieId', 'createdAt'],
    ['profileId', 'createdAt'],
  ],
});
db.aggregateCount(Vote, PollVoteCounter, 'count', { pollId: 'pollId' });
db.addTable(ParticipantVoteCounter);
db.addTable(ParticipantVoteValueCounter);
db.aggregateCount(Vote, ParticipantVoteCounter, 'count', { pollId: 'pollId', profileId: 'profileId' });
db.aggregateCount(Vote, ParticipantVoteValueCounter, 'count', {
  pollId: 'pollId',
  profileId: 'profileId',
  value: 'value',
});
db.addTable(Rating, {
  indexes: [
    ['profileId', 'createdAt'],
    ['movieId', 'createdAt'],
    ['movieId', 'profileId', 'createdAt'],
  ],
});

export default db;
