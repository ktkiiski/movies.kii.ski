import { table } from 'broilerkit/db';
import { poll, suggestion, vote } from './resources';

export const polls = table('Polls')
    .resource(poll)
    .identifyBy('id')
    .versionBy('version')
;

export const suggestions = table('Suggestions')
    .resource(suggestion)
    .identifyBy('id')
    .versionBy('version')
;

export const votes = table('Votes')
    .resource(vote)
    .identifyBy('id')
    .versionBy('version')
;
