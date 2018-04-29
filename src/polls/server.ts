import { Created, OK } from 'broilerkit/http';
import { implement } from 'broilerkit/server';
import { ulid } from 'broilerkit/ulid';
import * as api from './api';
import * as db from './db';

export const pollCollection = implement(api.pollCollection, db)
    .list(async ({ordering, since, direction}, {polls, users}, {auth}) => {
        // tslint:disable-next-line:no-console
        console.log(`Listing with user:`, await users.retrieve({id: auth.id}));
        const items = await polls.list({
            ordering, direction, since,
            minCount: 1,
            maxCount: 100,
        });
        return items;
    })
    .create(async (input, {polls, users}, {auth}) => {
        // tslint:disable-next-line:no-console
        console.log(`Creating with user:`, await users.retrieve({id: auth.id}));
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
    .retrieve(async ({id}, {polls}, {auth}) => {
        // tslint:disable-next-line:no-console
        console.log(`Retrieving with user:`, auth);
        return await polls.retrieve({id});
    })
    .update(async ({id, ...changes}, {polls, users}, {auth}) => {
        // tslint:disable-next-line:no-console
        console.log(`Updating with user:`, await users.retrieve({id: auth.id}));
        const now = new Date();
        const pollChanges = {
            ...changes,
            version: ulid(now),
            updatedAt: now,
        };
        const poll = await polls.update({id}, pollChanges);
        return new OK(poll);
    })
    .destroy(async ({id}, {polls, users}, {auth}) => {
        // tslint:disable-next-line:no-console
        console.log(`Destroying with user:`, await users.retrieve({id: auth.id}));
        await polls.destroy({id});
    })
;
