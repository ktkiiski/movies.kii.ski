import { create, destroy, list, retrieve, update } from 'broilerkit/api';
import { boolean, choice, datetime, integer, string } from 'broilerkit/fields';
import { resource } from 'broilerkit/resources';

const example = resource({
    id: string(),
    name: string(),
    age: integer(),
    isFine: boolean(),
    gender: choice(['male', 'female']),
    createdAt: datetime(),
    updatedAt: datetime(),
});

export const retrieveExample = retrieve(example)
    .url `/examples/${'id'}`
;

export const listExamples = list(example)
    .url `/examples`
    .paginated('createdAt')
;

export const createExample = create(example)
    .url `/examples`
    .payload('name', 'age')
    .optional('gender')
    .defaults('isFine', true)
;

export const updateExample = update(example)
    .url `/examples/${'id'}`
    .payload('name', 'age')
    .optional('gender')
    .defaults('isFine', true)
;

export const destroyExample = destroy(example)
    .url `/examples/${'id'}`
;
