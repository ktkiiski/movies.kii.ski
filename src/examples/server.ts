import { Created, NoContent, NotFound, OK } from 'broilerkit/http';
import { implementApi, implementList } from 'broilerkit/server';
import { ulid } from 'ulid';
import uuid1 = require('uuid/v1');
import * as api from './api';
import * as db from './db';

/**
 * API function that retrieves an example resource from mock data.
 */
export const retrieveExample = implementApi(api.retrieveExample, db, async ({id}, _, {examples}) => {
    const item = await examples.retrieve({id}, new NotFound('Example was not found.'));
    return new OK(item);
});

/**
 * API function that lists the example resources from mock data.
 */
export const listExamples = implementList(api.listExamples, db, async ({ordering, since, direction}, {examples}) => {
    return await examples.list({
        ordering, direction, since,
        minCount: 1,
        maxCount: 100,
    });
});

/**
 * API function that creates a new resource.
 */
export const createExample = implementApi(api.createExample, db, async (input, payload, {examples}) => {
    const now = new Date();
    const item = {
        ...input,
        ...payload,
        id: uuid1(),
        version: ulid(+now),
        createdAt: now,
        updatedAt: now,
        // TODO: Fix serializing
        isFine: payload.isFine == null ? false : payload.isFine,
        gender: (payload.gender == null ? 'male' : payload.gender) as 'male' | 'female',
    };
    await examples.create(item);
    return new Created(item);
});

/**
 * API function that updates a new resource.
 */
export const updateExample = implementApi(api.updateExample, db, async ({id}, changes, {examples}) => {
    const now = new Date();
    const itemChanges = {
        ...changes,
        version: ulid(+now),
        updatedAt: now,
    };
    const item = await examples.patch({id}, itemChanges, new NotFound('Example was not found.'));
    return new OK(item);
});

/**
 * API function that deletes a resource.
 */
export const destroyExample = implementApi(api.destroyExample, db, async ({id}, _, {examples}) => {
    await examples.destroy({id}, new NotFound('Example was not found.'));
    return new NoContent();
});
