import { order } from 'broilerkit/collections';
import { Created, NoContent, NotFound, OK } from 'broilerkit/http';
import { implementApi, implementList } from 'broilerkit/server';
import * as api from './api';

const MOCK_EXAMPLES = [{
    id: '1',
    name: 'John Smith',
    age: 29,
    isFine: true,
    gender: 'male' as 'male',
    createdAt: new Date(Date.UTC(2017, 8, 19, 16, 41, 35, 592)),
    updatedAt: new Date(Date.UTC(2017, 8, 19, 16, 41, 35, 592)),
}, {
    id: '2',
    name: 'Mary Smith',
    age: 25,
    isFine: false,
    gender: 'female' as 'female',
    createdAt: new Date(Date.UTC(2017, 8, 23, 18, 59, 3, 287)),
    updatedAt: new Date(Date.UTC(2017, 8, 23, 19, 3, 27, 701)),
}];

/**
 * API function that retrieves an example resource from mock data.
 */
export const retrieveExample = implementApi(api.retrieveExample, async ({id}) => {
    const item = MOCK_EXAMPLES.find((example) => example.id === id);
    if (item) {
        return new OK(item);
    }
    throw new NotFound('Example was not found.');
});

/**
 * API function that lists the example resources from mock data.
 */
export const listExamples = implementList(api.listExamples, async ({ordering, since, direction}) => {
    return order(MOCK_EXAMPLES, ordering, direction, since);
});

/**
 * API function that pretends to create a new resource.
 */
export const createExample = implementApi(api.createExample, async (input, payload) => {
    return new Created({
        ...input,
        ...payload,
        id: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
    });
});

/**
 * API function that pretends to update a new resource.
 */
export const updateExample = implementApi(api.updateExample, async ({id}, changes) => {
    const item = MOCK_EXAMPLES.find((example) => example.id === id);
    if (item) {
        return new OK({
            ...item,
            ...changes,
            updatedAt: new Date(),
        });
    }
    throw new NotFound('Example was not found.');
});

/**
 * API function that pretends to delete a resource.
 */
export const destroyExample = implementApi(api.destroyExample, async ({id}) => {
    const item = MOCK_EXAMPLES.find((example) => example.id === id);
    if (item) {
        return new NoContent();
    }
    throw new NotFound('Example was not found.');
});
