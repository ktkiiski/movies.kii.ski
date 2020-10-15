import { endpoint } from 'broilerkit/endpoints';
import { creatable, destroyable, listable, retrievable, updateable } from 'broilerkit/operations';
import { pattern } from 'broilerkit/url';
import {
  Movie,
  MovieSearchResult,
  Poll,
  PollCandidate,
  PollParticipant,
  PollRating,
  PollVote,
  RatingUpload,
  UserRating,
} from './resources';

/**
 * Polls
 */
const userPollCollection = endpoint(Poll, pattern`/api/users/${'profileId'}/polls`);
export const listUserPolls = listable(userPollCollection, {
  auth: 'owner',
  ownership: 'profileId',
  orderingKeys: ['createdAt'],
});
export const createUserPoll = creatable(userPollCollection, {
  auth: 'owner',
  ownership: 'profileId',
  required: ['title', 'description'],
  optional: [],
  defaults: {},
});

const userPollMember = endpoint(Poll, pattern`/api/users/${'profileId'}/polls/${'id'}`);
export const retrieveUserPoll = retrievable(userPollMember, {
  auth: 'owner',
  ownership: 'profileId',
});
export const destroyUserPoll = destroyable(userPollMember, {
  auth: 'owner',
  ownership: 'profileId',
});
export const updateUserPoll = updateable(userPollMember, {
  auth: 'owner',
  ownership: 'profileId',
  required: ['title'],
  optional: [],
  defaults: {},
});

const pollMember = endpoint(Poll, pattern`/api/polls/${'id'}`);
export const retrievePoll = retrievable(pollMember);

/**
 * Candidates
 */
const pollCandidateCollection = endpoint(PollCandidate, pattern`/api/polls/${'pollId'}/candidates`);
export const listPollCandidates = listable(pollCandidateCollection, {
  orderingKeys: ['createdAt'],
  filteringKeys: ['movieId', 'profileId'],
});
export const createPollCandidate = creatable(pollCandidateCollection, {
  auth: 'user',
  required: ['movieId'],
  optional: [],
  defaults: {},
});

const pollCandidateMember = endpoint(
  PollCandidate,
  pattern`/api/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`,
);
export const destroyPollCandidate = destroyable(pollCandidateMember, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Votes
 */
const pollVoteCollection = endpoint(PollVote, pattern`/api/polls/${'pollId'}/votes`);
export const listPollVotes = listable(pollVoteCollection, {
  orderingKeys: ['createdAt'],
  filteringKeys: ['movieId', 'profileId'],
});
export const createPollVote = creatable(pollVoteCollection, {
  auth: 'user',
  required: ['movieId', 'value'],
  optional: [],
  defaults: {},
});

const pollVoteMember = endpoint(PollVote, pattern`/api/polls/${'pollId'}/users/${'profileId'}/votes/${'movieId'}`);
export const updatePollVote = updateable(pollVoteMember, {
  auth: 'owner',
  ownership: 'profileId',
  required: ['value'],
  optional: [],
  defaults: {},
});
export const destroyPollVote = destroyable(pollVoteMember, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Participants
 */
const pollParticipantCollection = endpoint(PollParticipant, pattern`/api/polls/${'pollId'}/participants`);
export const listPollParticipants = listable(pollParticipantCollection, {
  orderingKeys: ['createdAt'],
});
export const createPollParticipant = creatable(pollParticipantCollection, {
  auth: 'user',
  required: [],
  optional: [],
  defaults: {},
});

const pollParticipantMember = endpoint(PollParticipant, pattern`/api/polls/${'pollId'}/participants/${'profileId'}`);
export const destroyPollParticipant = destroyable(pollParticipantMember, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Ratings
 */
const userRatingCollection = endpoint(UserRating, pattern`/api/users/${'profileId'}/ratings`);
export const listUserRatings = listable(userRatingCollection, {
  auth: 'none',
  ownership: 'profileId',
  orderingKeys: ['createdAt'],
  filteringKeys: ['movieId'],
});
export const createUserRating = creatable(userRatingCollection, {
  auth: 'owner',
  ownership: 'profileId',
  required: ['movieId', 'value'],
  optional: [],
  defaults: {},
});

const userRatingMember = endpoint(UserRating, pattern`/api/users/${'profileId'}/ratings/${'movieId'}`);
export const destroyUserRating = destroyable(userRatingMember, {
  auth: 'owner',
  ownership: 'profileId',
});

const userRatingUploadCollection = endpoint(RatingUpload, pattern`/api/users/${'profileId'}/ratings_uploads`);
export const createRatingUpload = creatable(userRatingUploadCollection, {
  auth: 'owner',
  ownership: 'profileId',
  required: [],
  optional: [],
  defaults: {},
});

/**
 * Poll ratings
 */

const pollRatingCollection = endpoint(PollRating, pattern`/api/polls/${'pollId'}/ratings`);
export const listPollRatings = listable(pollRatingCollection, {
  orderingKeys: ['createdAt'],
});
export const createPollRating = creatable(pollRatingCollection, {
  auth: 'user',
  required: ['movieId', 'value'],
  optional: [],
  defaults: {},
});

const pollCandidateRatingMember = endpoint(
  PollRating,
  pattern`/api/polls/${'pollId'}/candidates/${'movieId'}/ratings/${'profileId'}`,
);
export const destroyPollCandidateRating = destroyable(pollCandidateRatingMember, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Movies
 */
const movieMember = endpoint(Movie, pattern`/api/movies/${'id'}`);
export const retrieveMovie = retrievable(movieMember);

/**
 * Search results
 */
const queryMovieSearchResultCollection = endpoint(
  MovieSearchResult,
  pattern`/api/queries/${'query'}/movie_search_results`,
);
export const searchMovies = listable(queryMovieSearchResultCollection, {
  orderingKeys: ['index'],
});
