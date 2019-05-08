import { endpoint } from 'broilerkit/endpoints';
import { creatable, destroyable, listable, retrievable, updateable } from 'broilerkit/operations';
import { pattern } from 'broilerkit/url';
import { candidate, movie, movieSearchResult, participant, poll, publicProfile, rating, vote } from './resources';

/**
 * Polls
 */
const userPollCollection = endpoint(poll, pattern`/users/${'profileId'}/polls`);
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

const userPollResource = endpoint(poll, pattern`/users/${'profileId'}/polls/${'id'}`);
export const retrieveUserPoll = retrievable(userPollResource, {
  auth: 'owner',
  ownership: 'profileId',
});
export const destroyUserPoll = destroyable(userPollResource, {
  auth: 'owner',
  ownership: 'profileId',
});
export const updateUserPoll = updateable(userPollResource, {
  auth: 'owner',
  ownership: 'profileId',
  required: ['title'],
  optional: [],
  defaults: {},
});

const pollResource = endpoint(poll, pattern`/polls/${'id'}`);
export const retrievePoll = retrievable(pollResource);

/**
 * Candidates
 */
const pollCandidateCollection = endpoint(candidate, pattern`/polls/${'pollId'}/candidates`)
  .join({
    movie,
    profile: publicProfile,
  });
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

const pollCandidateResource = endpoint(candidate, pattern`/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`);
export const destroyPollCandidate = destroyable(pollCandidateResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Votes
 */
const pollVoteCollection = endpoint(vote, pattern`/polls/${'pollId'}/votes`)
  .join({
    profile: publicProfile,
  });
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

const pollVoteResource = endpoint(vote, pattern`/polls/${'pollId'}/users/${'profileId'}/votes/${'movieId'}`);
export const updatePollVote = updateable(pollVoteResource, {
  auth: 'owner',
  ownership: 'profileId',
  required: ['value'],
  optional: [],
  defaults: {},
});
export const destroyPollVote = destroyable(pollVoteResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Participants
 */
const pollParticipantCollection = endpoint(participant, pattern`/polls/${'pollId'}/participants`)
  .join({
    profile: publicProfile,
  });
export const listPollParticipants = listable(pollParticipantCollection, {
  orderingKeys: ['createdAt'],
});
export const createPollParticipant = creatable(pollParticipantCollection, {
  auth: 'user',
  required: [],
  optional: [],
  defaults: {},
});

const pollParticipantResource = endpoint(participant, pattern`/polls/${'pollId'}/participants/${'profileId'}`);
export const destroyPollParticipant = destroyable(pollParticipantResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Ratings
 */
const userRatingCollection = endpoint(rating, pattern`/users/${'profileId'}/ratings`);
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

const userRatingResource = endpoint(rating, pattern`/users/${'profileId'}/ratings/${'movieId'}`);
export const destroyUserRating = destroyable(userRatingResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Movies
 */
const movieResource = endpoint(movie, pattern`/movies/${'id'}`);
export const retrieveMovie = retrievable(movieResource);

/**
 * Search results
 */
const queryMovieSearchResultCollection = endpoint(movieSearchResult, pattern`/queries/${'query'}/movie_search_results`);
export const searchMovies = listable(queryMovieSearchResultCollection, {
  orderingKeys: ['index'],
});
