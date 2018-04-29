import { endpoint } from 'broilerkit/api';
import { poll, suggestion, vote } from './resources';

export const pollCollection = endpoint(poll)
    .url `/polls`
    .listable({
        orderingKeys: ['createdAt'],
        auth: 'admin',
    })
    .creatable({
        auth: 'admin',
        required: ['title', 'urlKey'],
        optional: ['description'],
        defaults: {
            websiteUrl: null,
        },
    })
;

export const pollResource = endpoint(poll)
    .url `/polls/${'id'}`
    .retrievable()
    .destroyable({
        auth: 'user',
    })
    .updateable({
        auth: 'user',
        required: ['title'],
        optional: ['description'],
        defaults: {
            websiteUrl: null,
        },
    })
;

export const pollSuggestionCollection = endpoint(suggestion)
    .url `/polls/${'pollId'}/suggestions`
    .listable(['createdAt'])
    .creatable({
        auth: 'user',
        required: ['title'],
        optional: [],
        defaults: {},
    })
;

export const pollSuggestionResource = endpoint(suggestion)
    .url `/polls/${'pollId'}/suggestions/${'id'}`
    .retrievable()
    .updateable({
        auth: 'user',
        required: ['title'],
        optional: [],
        defaults: {},
    })
    .destroyable({
        auth: 'user',
    })
;

export const pollSuggestionVoteCollection = endpoint(vote)
    .url `/polls/${'pollId'}/suggestions/${'suggestionId'}/votes`
    .listable(['createdAt'])
    .creatable({
        auth: 'user',
        required: ['value'],
        optional: [],
        defaults: {},
    })
;

export const pollSuggestionVoteResource = endpoint(vote)
    .url `/polls/${'pollId'}/suggestions/${'suggestionId'}/votes/${'id'}`
    .retrievable()
    .destroyable({
        auth: 'user',
    })
;

export const pollVoteCollection = endpoint(vote)
    .url `/polls/${'pollId'}/votes`
    .listable(['createdAt'])
;
