import { endpoint } from 'broilerkit/api';
import { pattern } from 'broilerkit/url';
import { candidate, movie, movieSearchResult, participant, poll, publicProfile, rating, vote } from './resources';

const userPollCollection = endpoint(poll, pattern `/users/${'profileId'}/polls`);
export const listUserPolls = userPollCollection.listable({
    auth: 'owner',
    ownership: 'profileId',
    orderingKeys: ['createdAt'],
});
export const createUserPoll = userPollCollection.creatable({
    auth: 'owner',
    ownership: 'profileId',
    required: ['title', 'description'],
    optional: [],
    defaults: {},
});

const userPollResource = endpoint(poll, pattern `/users/${'profileId'}/polls/${'id'}`);
export const retrieveUserPoll = userPollResource.retrievable({
    auth: 'owner',
    ownership: 'profileId',
});
export const destroyUserPoll = userPollResource.destroyable({
    auth: 'owner',
    ownership: 'profileId',
});
export const updateUserPoll = userPollResource.updateable({
    auth: 'owner',
    ownership: 'profileId',
    required: ['title'],
    optional: [],
    defaults: {},
});

const pollResource = endpoint(poll, pattern `/polls/${'id'}`);
export const retrievePoll = pollResource.retrievable();

const pollCandidateCollection = endpoint(candidate, pattern `/polls/${'pollId'}/candidates`)
    .join({
        movie,
        profile: publicProfile,
    })
;
export const listPollCandidates = pollCandidateCollection.listable({
    orderingKeys: ['createdAt'],
    filteringKeys: ['movieId', 'profileId'],
});
export const createPollCandidate = pollCandidateCollection.creatable({
    auth: 'user',
    required: ['movieId'],
    optional: [],
    defaults: {},
});

const pollCandidateResource = endpoint(candidate, pattern `/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`);
export const destroyPollCandidate = pollCandidateResource.destroyable({
    auth: 'owner',
    ownership: 'profileId',
});

const pollVoteCollection = endpoint(vote, pattern `/polls/${'pollId'}/votes`)
    .join({
        profile: publicProfile,
    })
;
export const listPollVotes = pollVoteCollection.listable({
    orderingKeys: ['createdAt'],
    filteringKeys: ['movieId', 'profileId'],
});
export const createPollVote = pollVoteCollection.creatable({
    auth: 'user',
    required: ['movieId', 'value'],
    optional: [],
    defaults: {},
});

const pollVoteResource = endpoint(vote, pattern `/polls/${'pollId'}/users/${'profileId'}/votes/${'movieId'}`);
export const updatePollVote = pollVoteResource.updateable({
    auth: 'owner',
    ownership: 'profileId',
    required: ['value'],
    optional: [],
    defaults: {},
});
export const destroyPollVote = pollVoteResource.destroyable({
    auth: 'owner',
    ownership: 'profileId',
});

const pollParticipantCollection = endpoint(participant, pattern `/polls/${'pollId'}/participants`)
    .join({
        profile: publicProfile,
    })
;
export const listPollParticipants = pollParticipantCollection.listable({
    orderingKeys: ['createdAt'],
});
export const createPollParticipant = pollParticipantCollection.creatable({
    auth: 'user',
    required: [],
    optional: [],
    defaults: {},
});

const pollParticipantResource = endpoint(participant, pattern `/polls/${'pollId'}/participants/${'profileId'}`);
export const destroyPollParticipant = pollParticipantResource.destroyable({
    auth: 'owner',
    ownership: 'profileId',
});

const userRatingCollection = endpoint(rating, pattern `/users/${'profileId'}/ratings`);
export const listUserRatings = userRatingCollection.listable({
    auth: 'none',
    ownership: 'profileId',
    orderingKeys: ['createdAt'],
    filteringKeys: ['movieId'],
});
export const createUserRating = userRatingCollection.creatable({
    auth: 'owner',
    ownership: 'profileId',
    required: ['movieId', 'value'],
    optional: [],
    defaults: {},
});

const userRatingResource = endpoint(rating, pattern `/users/${'profileId'}/ratings/${'movieId'}`);
export const destroyUserRating = userRatingResource.destroyable({
    auth: 'owner',
    ownership: 'profileId',
});

const movieResource = endpoint(movie, pattern `/movies/${'id'}`);
export const retrieveMovie = movieResource.retrievable();

const queryMovieSearchResultCollection = endpoint(movieSearchResult, pattern `/queries/${'query'}/movie_search_results`);
export const searchMovies = queryMovieSearchResultCollection.listable({
    orderingKeys: ['index'],
});
