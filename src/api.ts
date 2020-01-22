import { endpoint } from 'broilerkit/endpoints';
import { creatable, destroyable, listable, retrievable, updateable, uploadable } from 'broilerkit/operations';
import { pattern } from 'broilerkit/url';
import { Movie, MovieSearchResult, Poll, PollCandidate, PollParticipant, PollRating, PollVote, RatingUpload, UserRating } from './resources';

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

const userPollResource = endpoint(Poll, pattern`/api/users/${'profileId'}/polls/${'id'}`);
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

const pollResource = endpoint(Poll, pattern`/api/polls/${'id'}`);
export const retrievePoll = retrievable(pollResource);

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

const pollCandidateResource = endpoint(PollCandidate, pattern`/api/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`);
export const destroyPollCandidate = destroyable(pollCandidateResource, {
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

const pollVoteResource = endpoint(PollVote, pattern`/api/polls/${'pollId'}/users/${'profileId'}/votes/${'movieId'}`);
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

const pollParticipantResource = endpoint(PollParticipant, pattern`/api/polls/${'pollId'}/participants/${'profileId'}`);
export const destroyPollParticipant = destroyable(pollParticipantResource, {
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

const userRatingResource = endpoint(UserRating, pattern`/api/users/${'profileId'}/ratings/${'movieId'}`);
export const destroyUserRating = destroyable(userRatingResource, {
  auth: 'owner',
  ownership: 'profileId',
});

const userRatingUploadCollection = endpoint(RatingUpload, pattern`/api/users/${'profileId'}/ratings_uploads`);
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

const pollCandidateRatingResource = endpoint(PollRating, pattern`/api/polls/${'pollId'}/candidates/${'movieId'}/ratings/${'profileId'}`);
export const destroyPollCandidateRating = destroyable(pollCandidateRatingResource, {
  auth: 'owner',
  ownership: 'profileId',
});

/**
 * Movies
 */
const movieResource = endpoint(Movie, pattern`/api/movies/${'id'}`);
export const retrieveMovie = retrievable(movieResource);

/**
 * Search results
 */
const queryMovieSearchResultCollection = endpoint(MovieSearchResult, pattern`/api/queries/${'query'}/movie_search_results`);
export const searchMovies = listable(queryMovieSearchResultCollection, {
  orderingKeys: ['index'],
});
