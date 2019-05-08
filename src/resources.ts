import { boolean, constant, date, datetime, decimal, id, integer, list, matching, nullable, number, string, text, url } from 'broilerkit/fields';
import { Deserialization, resource } from 'broilerkit/resources';
import { user } from 'broilerkit/users';

export const profile = resource({
    name: 'profile',
    fields: {
        id: user.fields.id,
        name: user.fields.name,
        email: user.fields.email,
        picture: user.fields.picture,
        groups: list(string()),
        version: id(),
    },
    identifyBy: ['id'],
    versionBy: 'version',
});

export const publicProfile = profile.expose(['name', 'picture']);

export type PublicProfile = Deserialization<typeof publicProfile>;

export const movie = resource({
    name: 'movie',
    fields: {
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
    },
    identifyBy: ['id'],
    versionBy: 'version',
});

export type Movie = Deserialization<typeof movie>;

export const movieSearchResult = resource({
    name: 'movieSearchResult',
    fields: {
        id: integer(),
        query: string(),
        index: integer(),
    },
    identifyBy: ['id'],
});

export type MovieSearchResult = Deserialization<typeof movieSearchResult>;

export const poll = resource({
    name: 'poll',
    fields: {
        id: id(),
        version: id(),
        title: string(),
        description: text(),
        profileId: profile.fields.id,
        createdAt: datetime(),
        updatedAt: datetime(),
    },
    identifyBy: ['id'],
    versionBy: 'version',
});

export const participant = resource({
    name: 'participant',
    fields: {
        version: id(),
        pollId: poll.fields.id,
        profileId: publicProfile.fields.id,
        createdAt: datetime(),
        updatedAt: datetime(),
    },
    identifyBy: ['pollId', 'profileId'],
    versionBy: 'version',
});

export const candidate = resource({
    name: 'candidate',
    fields: {
        version: id(),
        pollId: poll.fields.id,
        movieId: movie.fields.id,
        profileId: profile.fields.id,
        createdAt: datetime(),
        updatedAt: datetime(),
    },
    identifyBy: ['pollId', 'movieId'],
    versionBy: 'version',
});

export type Candidate = Deserialization<typeof candidate>;

export interface DetailedCandidate extends Candidate {
    movie: Movie | null;
    profile: PublicProfile | null;
}

export const vote = resource({
    name: 'vote',
    fields: {
        version: id(),
        pollId: poll.fields.id,
        movieId: movie.fields.id,
        profileId: profile.fields.id,
        value: constant([-1, 0, 1]),
        createdAt: datetime(),
        updatedAt: datetime(),
    },
    identifyBy: ['pollId', 'movieId', 'profileId'],
    versionBy: 'version',
});

export type Vote = Deserialization<typeof vote>;

export const rating = resource({
    name: 'rating',
    fields: {
        version: id(),
        profileId: profile.fields.id,
        movieId: movie.fields.id,
        value: nullable(integer({
            min: 1,
            max: 10,
        })),
        createdAt: datetime(),
        updatedAt: datetime(),
    },
    identifyBy: ['profileId', 'movieId'],
    versionBy: 'version',
});

export type Rating = Deserialization<typeof rating>;
