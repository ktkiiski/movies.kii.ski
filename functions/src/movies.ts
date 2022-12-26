import { fields, serializer, ValueOf } from 'serializers';

export const movieSerializer = serializer({
  id: fields.integer(),
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),

  type: fields.choice(['movie', 'series']),

  imdbId: fields.nullable(fields.string(1, 64, true)),
  title: fields.nullable(fields.string(0, 1024, true)),
  originalTitle: fields.nullable(fields.string(0, 1024, true)),
  tagline: fields.nullable(fields.string(0, null, true)),
  overview: fields.string(0, null, true),
  homePageUrl: fields.nullable(fields.url()),

  releasedOn: fields.nullable(fields.date()),
  popularity: fields.nullable(fields.number()),
  runtime: fields.nullable(fields.integer()),
  budget: fields.nullable(fields.integer()),
  revenue: fields.nullable(fields.integer()),
  voteAverage: fields.nullable(fields.decimal(1)),
  voteCount: fields.nullable(fields.integer()),
  isAdult: fields.nullable(fields.boolean()),

  posterPath: fields.nullable(fields.matching(/^\/.+\.(jpg|png)$/, 'Invalid path')),
  backdropPath: fields.nullable(fields.matching(/^\/.+\.(jpg|png)$/, 'Invalid path')),

  genres: fields.list(fields.string(0, 1024, true)),
  languages: fields.list(fields.string(0, 1024, true)),
});

export type Movie = ValueOf<typeof movieSerializer>;

export const movieSearchResultSerializer = movieSerializer.pick([
  'id',
  'posterPath',
  'isAdult',
  'overview',
  'releasedOn',
  'originalTitle',
  'title',
  'backdropPath',
  'popularity',
  'voteCount',
  'voteAverage',
]);

export type MovieSearchResult = ValueOf<typeof movieSearchResultSerializer>;
