import { ApiEndpoint, ApiResponse } from 'broilerkit/endpoints';
import * as moment from 'moment';
import { of } from 'rxjs/observable/of';
import * as api from './api';

import find = require('lodash/find');

const MOCK_EXAMPLES = [{
    id: '1',
    name: 'John Smith',
    age: 29,
    isFine: true,
    createdAt: '2017-08-19T16:41:35.592Z',
    updatedAt: '2017-08-19T16:41:35.592Z',
}, {
    id: '2',
    name: 'Mary Smith',
    age: 25,
    isFine: false,
    createdAt: '2017-08-23T18:59:03.287Z',
    updatedAt: '2017-08-23T19:03:27.701Z',
}];

export const retrieveExample = new ApiEndpoint(api.retrieveExample, ({id}) => {
    const item = find(MOCK_EXAMPLES, {id});
    if (item) {
        return of(new ApiResponse(200, item));
    }
    return of(new ApiResponse(404, {
        message: 'Example was not found.',
    }));
});

export const listExamples = new ApiEndpoint(api.listExamples, () => {
    return of(new ApiResponse(200, {
        next: null,
        results: MOCK_EXAMPLES,
    }));
});

export const createExample = new ApiEndpoint(api.createExample, (input) => {
    return of(new ApiResponse(201, {
        ...input,
        id: '3',
        createdAt: moment().toISOString(),
        updatedAt: moment().toISOString(),
    }));
});

export const updateExample = new ApiEndpoint(api.updateExample, ({id, ...changes}) => {
    const item = find(MOCK_EXAMPLES, {id});
    if (item) {
        return of(new ApiResponse(200, {
            ...item,
            ...changes,
            updatedAt: moment().toISOString(),
        }));
    }
    return of(new ApiResponse(404, {
        message: 'Example was not found.',
    }));
});

export const deleteExample = new ApiEndpoint(api.deleteExample, ({id}) => {
    const item = find(MOCK_EXAMPLES, {id});
    if (item) {
        return of(new ApiResponse(204));
    }
    return of(new ApiResponse(404, {
        message: 'Example was not found.',
    }));
});
