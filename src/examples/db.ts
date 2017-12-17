import { boolean, choice, datetime, integer, string, ulid, uuid } from 'broilerkit/fields';
import { simpleDB } from 'broilerkit/simpledb';

export const examples = simpleDB('Examples')
    .attributes({
        id: uuid(1),
        version: ulid(),
        name: string(),
        age: integer(),
        isFine: boolean(),
        gender: choice(['male', 'female']),
        createdAt: datetime(),
        updatedAt: datetime(),
    })
    .identify('id', 'version')
;

export const exampleSubItems = simpleDB('ExampleSubItems')
    .attributes({
        id: uuid(1),
        version: ulid(),
        exampleId: uuid(1),
        name: string(),
        createdAt: datetime(),
    })
    .identify('exampleId', 'version')
;
