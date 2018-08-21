import { boolean, constant, date, datetime, decimal, id, integer, list, matching, nullable, number, string, text, url } from 'broilerkit/fields';
import { Deserialization, nested, resource } from 'broilerkit/resources';
import { user, User } from 'broilerkit/users';

export const profile = user
    .pick(['id', 'name', 'email', 'picture'])
    .extend({
        groups: list(string()),
        version: id(),
    })
;

export type Profile = Deserialization<typeof profile>;
export type PublicProfile = Pick<User, 'id' | 'name' | 'picture'>;

export const movie = resource({
    id: integer(),
    version: id(),
    createdAt: datetime(),
    updatedAt: datetime(),

    imdbId: nullable(string()),
    title: nullable(string()),
    originalTitle: nullable(string()),
    tagline: text(),
    overview: text(),
    homePageUrl: nullable(url()),

    releasedOn: nullable(date()),
    popularity: nullable(number()),
    runtime: nullable(integer()),
    budget: nullable(integer()),
    revenue: nullable(integer()),
    voteAverage: nullable(decimal(1)),
    voteCount: nullable(integer()),
    isAdult: nullable(boolean()),

    posterPath: nullable(matching(/^\/.+\.(jpg|png)$/, `Invalid path`)),
    backdropPath: nullable(matching(/^\/.+\.(jpg|png)$/, `Invalid path`)),

    genres: list(string()),
    languages: list(string()),
});

export type Movie = Deserialization<typeof movie>;

export const movieSearchResult = resource({
    id: integer(),
    query: string(),
    index: integer(),
});

export type MovieSearchResult = Deserialization<typeof movieSearchResult>;

export const poll = resource({
    id: id(),
    version: id(),
    title: string(),
    description: text(),
    profileId: profile.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
});

export type Poll = Deserialization<typeof poll>;

export const candidate = resource({
    version: id(),
    pollId: poll.fields.id,
    movieId: movie.fields.id,
    profileId: profile.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
});

export type Candidate = Deserialization<typeof candidate>;

export const detailedCandidate = candidate.extend({
    movie: nullable(nested(movie)),
    profile: nullable(nested(
        profile.pick(['id', 'name', 'picture']),
    )),
});

export type DetailedCandidate = Deserialization<typeof detailedCandidate>;

export const vote = resource({
    version: id(),
    pollId: poll.fields.id,
    movieId: movie.fields.id,
    profileId: profile.fields.id,
    value: constant([-1, 0, 1]),
    createdAt: datetime(),
    updatedAt: datetime(),
});

export const detailedVote = vote.extend({
    movie: nullable(nested(movie)),
    profile: nullable(nested(
        profile.pick(['id', 'name', 'picture']),
    )),
});

export type Vote = Deserialization<typeof vote>;

export const rating = resource({
    version: id(),
    profileId: profile.fields.id,
    movieId: movie.fields.id,
    value: nullable(integer({
        min: 1,
        max: 10,
    })),
    createdAt: datetime(),
    updatedAt: datetime(),
});

export type Rating = Deserialization<typeof rating>;
