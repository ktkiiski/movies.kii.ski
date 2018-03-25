import { constant, datetime, nullable, string, ulid, url } from 'broilerkit/fields';
import { resource } from 'broilerkit/resources';

export const poll = resource({
    id: ulid(),
    version: ulid(),
    title: string(),
    description: string(),
    websiteUrl: nullable(url()),
    urlKey: string(),
    createdAt: datetime(),
    updatedAt: datetime(),
});

export const suggestion = resource({
    id: ulid(),
    version: ulid(),
    pollId: ulid(),
    title: string(),
    createdAt: datetime(),
    updatedAt: datetime(),
});

export const vote = resource({
    id: ulid(),
    version: ulid(),
    pollId: ulid(),
    suggestionId: ulid(),
    value: constant([-1, 0, 1]),
    createdAt: datetime(),
    updatedAt: datetime(),
});
