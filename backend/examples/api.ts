import { CreateApi, DeleteApi, ListApi, RetrieveApi, UpdateApi } from 'broilerkit/api';
import { BooleanField, IntegerField, StringField } from 'broilerkit/fields';

interface IExampleInput {
    name: string;
    age: number;
    isFine: boolean;
}

interface IExampleUpdate extends IExampleInput {
    id: string;
}

interface IExample {
    id: string;
    name: string;
    age: number;
    isFine: boolean;
    createdAt: string;
    updatedAt: string;
}

export const retrieveExample = new RetrieveApi<{id: string}, IExample>({
    auth: false,
    url: '/examples/{id}',
    params: { id: new StringField() },
});

export const listExamples = new ListApi<{}, IExample>({
    auth: false,
    url: '/examples',
    params: {},
});

export const createExample = new CreateApi<IExampleInput, IExample>({
    auth: true,
    url: '/examples',
    params: {
        name: new StringField(),
        age: new IntegerField(),
        isFine: new BooleanField(),
    },
});

export const updateExample = new UpdateApi<IExampleUpdate, IExample>({
    auth: true,
    url: '/examples/{id}',
    params: {
        id: new StringField(),
        name: new StringField(),
        age: new IntegerField(),
        isFine: new BooleanField(),
    },
});

export const deleteExample = new DeleteApi<{id: string}>({
    auth: true,
    url: '/examples/{id}',
    params: { id: new StringField() },
});
