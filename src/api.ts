import { endpoint } from 'broilerkit/api';
import { candidate, movie, movieSearchResult, participant, poll, publicProfile, rating, vote } from './resources';

export const userPollCollection = endpoint(poll)
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

export const userPollResource = endpoint(poll)
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

export const pollResource = endpoint(poll)
    .url `/polls/${'id'}`
    .retrievable()
;

export const pollCandidateCollection = endpoint(candidate)
    .url `/polls/${'pollId'}/candidates`
    .join({
        movie,
        profile: publicProfile,
    })
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

export const pollCandidateResource = endpoint(candidate)
    .url `/polls/${'pollId'}/users/${'profileId'}/candidates/${'movieId'}`
    .authorizeBy('profileId')
    .destroyable({
        auth: 'user',
    })
;

export const pollVoteCollection = endpoint(vote)
    .url `/polls/${'pollId'}/votes`
    .join({
        profile: publicProfile,
    })
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

export const pollVoteResource = endpoint(vote)
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

export const pollParticipantCollection = endpoint(participant)
    .url `/polls/${'pollId'}/participants`
    .join({
        profile: publicProfile,
    })
    .listable({
        orderingKeys: ['createdAt'],
    })
    .creatable({
        auth: 'user',
        required: [],
        optional: [],
        defaults: {},
    })
;

export const pollParticipantResource = endpoint(participant)
    .url `/polls/${'pollId'}/participants/${'profileId'}`
    .authorizeBy('profileId')
    .destroyable({
        auth: 'user',
    })
;

export const userRatingCollection = endpoint(rating)
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

export const userRatingResource = endpoint(rating)
    .url `/users/${'profileId'}/ratings/${'movieId'}`
    .authorizeBy('profileId')
    .destroyable({
        auth: 'user',
    })
;

export const movieResource = endpoint(movie)
    .url `/movies/${'id'}`
    .retrievable()
;

export const queryMovieSearchResultCollection = endpoint(movieSearchResult)
    .url `/queries/${'query'}/movie_search_results`
    .listable({
        orderingKeys: ['index'],
    })
;
