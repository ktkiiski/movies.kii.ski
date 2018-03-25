import { Created, OK } from 'broilerkit/http';
import { implement } from 'broilerkit/server';
import { ulid } from 'broilerkit/ulid';
import * as api from './api';
import * as db from './db';

export const pollCollection = implement(api.pollCollection, db)
    .list(async ({ordering, since, direction}, {polls}) => {
        const items = await polls.list({
            ordering, direction, since,
            minCount: 1,
            maxCount: 100,
        });
        return items;
    })
    .create(async (input, {polls}) => {
        const now = new Date();
        const poll = {
            description: '',
            ...input,
            id: ulid(now),
            version: ulid(now),
            createdAt: now,
            updatedAt: now,
        };
        await polls.create(poll);
        return new Created(poll);
    })
;

export const pollResource = implement(api.pollResource, db)
    .retrieve(async ({id}, {polls}) => {
        return await polls.retrieve({id});
    })
    .update(async ({id, ...changes}, {polls}) => {
        const now = new Date();
        const pollChanges = {
            ...changes,
            version: ulid(now),
            updatedAt: now,
        };
        const poll = await polls.update({id}, pollChanges);
        return new OK(poll);
    })
    .destroy(async ({id}, {polls}) => {
        await polls.destroy({id});
    })
;
