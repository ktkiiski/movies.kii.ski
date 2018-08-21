import { endpoint } from 'broilerkit/api';
import { detailedCandidate, detailedVote, movie, movieSearchResult, poll, rating } from './resources';

export const userPollCollection = endpoint(poll, 'id')
    .url `/users/${'profileId'}/polls`
    .authorizeBy('profileId')
    .listable({
        auth: 'user',
        orderingKeys: ['createdAt'],
    })
    .creatable({
        auth: 'user',
        required: ['title', 'description'],
        optional: [],
        defaults: {},
    })
;

export const userPollResource = userPollCollection.singleton()
    .url `/users/${'profileId'}/polls/${'id'}`
    .authorizeBy('profileId')
    .retrievable({
        auth: 'user',
    })
    .destroyable({
        auth: 'user',
    })
    .updateable({
        auth: 'user',
        required: ['title'],
        optional: [],
        defaults: {},
    })
;

export const pollResource = endpoint(poll, 'id')
    .url `/polls/${'id'}`
    .retrievable()
;

export const pollCandidateCollection = endpoint(detailedCandidate, 'movieId')
    .url `/polls/${'pollId'}/candidates`
    .listable({
        orderingKeys: ['createdAt'],
    })
    .creatable({
        auth: 'user',
        required: ['movieId'],
        optional: [],
        defaults: {},
    })
;

export const pollCandidateResource = pollCandidateCollection.singleton()
    .url `/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`
    .authorizeBy('profileId')
    .destroyable({
        auth: 'user',
    })
;

export const pollVoteCollection = endpoint(detailedVote, 'profileId', 'movieId')
    .url `/polls/${'pollId'}/votes`
    .listable({
        orderingKeys: ['createdAt'],
    })
    .creatable({
        auth: 'user',
        required: ['movieId', 'value'],
        optional: [],
        defaults: {},
    })
;

export const pollVoteResource = pollVoteCollection.singleton()
    .url `/polls/${'pollId'}/users/${'profileId'}/votes/${'movieId'}`
    .authorizeBy('profileId')
    .updateable({
        auth: 'user',
        required: ['value'],
        optional: [],
        defaults: {},
    })
    .destroyable({
        auth: 'user',
    })
;

export const userRatingCollection = endpoint(rating, 'movieId')
    .url `/users/${'profileId'}/ratings`
    .authorizeBy('profileId')
    .listable({
        orderingKeys: ['createdAt'],
    })
    .creatable({
        auth: 'user',
        required: ['movieId', 'value'],
        optional: [],
        defaults: {},
    })
;

export const userRatingResource = userRatingCollection.singleton()
    .url `/users/${'profileId'}/ratings/${'movieId'}`
    .authorizeBy('profileId')
    .destroyable({
        auth: 'user',
    })
;

export const movieResource = endpoint(movie, 'id')
    .url `/movies/${'id'}`
    .retrievable()
;

export const queryMovieSearchResultCollection = endpoint(movieSearchResult, 'id')
    .url `/queries/${'query'}/movie_search_results`
    .listable({
        orderingKeys: ['index'],
    })
;
