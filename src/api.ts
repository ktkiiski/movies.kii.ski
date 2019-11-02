import { endpoint } from 'broilerkit/endpoints';
import { creatable, destroyable, listable, retrievable, updateable, uploadable } from 'broilerkit/operations';
import { pattern } from 'broilerkit/url';
import { candidate, movie, movieSearchResult, participant, poll, pollRating, publicProfile, rating, ratingUpload, vote } from './resources';

/**
 * Polls
 */
const userPollCollection = endpoint(poll, pattern`/api/users/${'profileId'}/polls`);
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

const userPollResource = endpoint(poll, pattern`/api/users/${'profileId'}/polls/${'id'}`);
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

const pollResource = endpoint(poll, pattern`/api/polls/${'id'}`);
export const retrievePoll = retrievable(pollResource);

/**
 * Candidates
 */
const pollCandidateCollection = endpoint(candidate, pattern`/api/polls/${'pollId'}/candidates`)
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

const pollCandidateResource = endpoint(candidate, pattern`/api/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`);
export const destroyPollCandidate = destroyable(pollCandidateResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Votes
 */
const pollVoteCollection = endpoint(vote, pattern`/api/polls/${'pollId'}/votes`)
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

const pollVoteResource = endpoint(vote, pattern`/api/polls/${'pollId'}/users/${'profileId'}/votes/${'movieId'}`);
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
const pollParticipantCollection = endpoint(participant, pattern`/api/polls/${'pollId'}/participants`)
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

const pollParticipantResource = endpoint(participant, pattern`/api/polls/${'pollId'}/participants/${'profileId'}`);
export const destroyPollParticipant = destroyable(pollParticipantResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Ratings
 */
const userRatingCollection = endpoint(rating, pattern`/api/users/${'profileId'}/ratings`)
  .join({ movie })
;
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

const userRatingResource = endpoint(rating, pattern`/api/users/${'profileId'}/ratings/${'movieId'}`);
export const destroyUserRating = destroyable(userRatingResource, {
  auth: 'owner',
  ownership: 'profileId',
});

const userRatingUploadCollection = endpoint(ratingUpload, pattern`/api/users/${'profileId'}/ratings_uploads`);
export const uploadUserRatings = uploadable(userRatingUploadCollection, {
  auth: 'owner',
  ownership: 'profileId',
  required: [],
  optional: [],
  defaults: {},
  files: ['file'],
});

/**
 * Poll ratings
 */

const pollRatingCollection = endpoint(pollRating, pattern`/api/polls/${'pollId'}/ratings`)
  .join({ profile: publicProfile })
;
export const listPollRatings = listable(pollRatingCollection, {
  orderingKeys: ['createdAt'],
});
export const createPollRating = creatable(pollRatingCollection, {
  auth: 'user',
  required: ['movieId', 'value'],
  optional: [],
  defaults: {},
});

const pollCandidateRatingResource = endpoint(pollRating, pattern`/api/polls/${'pollId'}/candidates/${'movieId'}/ratings/${'profileId'}`);
export const destroyPollCandidateRating = destroyable(pollCandidateRatingResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Movies
 */
const movieResource = endpoint(movie, pattern`/api/movies/${'id'}`);
export const retrieveMovie = retrievable(movieResource);

/**
 * Search results
 */
const queryMovieSearchResultCollection = endpoint(movieSearchResult, pattern`/api/queries/${'query'}/movie_search_results`);
export const searchMovies = listable(queryMovieSearchResultCollection, {
  orderingKeys: ['index'],
});
