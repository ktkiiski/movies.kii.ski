import { endpoint } from 'broilerkit/api';
import { poll, suggestion, vote } from './resources';

export const pollCollection = endpoint(poll)
    .url `/polls`
    .listable(['createdAt'])
    .creatable({
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
    .destroyable()
    .updateable({
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
        required: ['title'],
        optional: [],
        defaults: {},
    })
;

export const pollSuggestionResource = endpoint(suggestion)
    .url `/polls/${'pollId'}/suggestions/${'id'}`
    .retrievable()
    .updateable({
        required: ['title'],
        optional: [],
        defaults: {},
    })
    .destroyable()
;

export const pollSuggestionVoteCollection = endpoint(vote)
    .url `/polls/${'pollId'}/suggestions/${'suggestionId'}/votes`
    .listable(['createdAt'])
    .creatable({
        required: ['value'],
        optional: [],
        defaults: {},
    })
;

export const pollSuggestionVoteResource = endpoint(vote)
    .url `/polls/${'pollId'}/suggestions/${'suggestionId'}/votes/${'id'}`
    .retrievable()
    .destroyable()
;

export const pollVoteCollection = endpoint(vote)
    .url `/polls/${'pollId'}/votes`
    .listable(['createdAt'])
;
