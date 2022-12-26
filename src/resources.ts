/* eslint-disable @typescript-eslint/no-redeclare */
import { serializer, ValueOf, fields } from 'serializers';

const idField = fields.matching(/^[a-z0-9_-]{1,32}$/i, 'Invalid ID');

// export interface Resource<T> {
//   serializer: Serializer<T>;
//   path: string[];
//   identifier: Array<keyof T>;
// }

// function resource<T>(collectionName: string, resourceFields: Fields<T>, identifier: Array<keyof T>): Resource<T> {
//   return {
//     path: collectionName.split('/'),
//     serializer: serializer(resourceFields),
//     identifier,
//   };
// }

export const PublicProfile = serializer({
  id: idField,
  name: fields.nullable(fields.string(0, 256, true)),
  // email: fields.nullable(fields.email()),
  picture: fields.nullable(fields.url()),
  groups: fields.list(fields.string(1, 64, true)),
});

/*
export const PublicProfile = Profile.pick(['id', 'name', 'picture']);
*/
export type PublicProfile = ValueOf<typeof PublicProfile>;

export const Movie = serializer({
  id: fields.integer(),
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),

  type: fields.choice(['movie', 'series']),

  imdbId: fields.nullable(fields.string(1, 64, true)),
  title: fields.nullable(fields.string(0, 1024, true)),
  originalTitle: fields.nullable(fields.string(0, 1024, true)),
  tagline: fields.string(0, null, true),
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

  posterPath: fields.nullable(fields.matching(/^\/.+\.(jpg|png)$/, `Invalid path`)),
  backdropPath: fields.nullable(fields.matching(/^\/.+\.(jpg|png)$/, `Invalid path`)),

  genres: fields.list(fields.string(0, 1024, true)),
  languages: fields.list(fields.string(0, 1024, true)),
});

export type Movie = ValueOf<typeof Movie>;

export const MovieSearchResult = serializer({
  id: fields.integer(),
  query: fields.string(0, 1024, true),
  index: fields.integer(),
});

export type MovieSearchResult = ValueOf<typeof MovieSearchResult>;

export const Poll = serializer({
  id: idField,
  title: fields.string(0, 256, true),
  description: fields.string(0, 2048, true),
  profileId: PublicProfile.fields.id,
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),
});

export type Poll = ValueOf<typeof Poll>;

/*
export const PollCandidateCounter = serializer({
  pollId: Poll.fields.id,
  count: fields.integer(),
});

export const PollParticipantCounter = serializer({
  pollId: Poll.fields.id,
  count: fields.integer(),
});

export const PollVoteCounter = serializer({
  pollId: Poll.fields.id,
  count: fields.integer(),
});
*/

export const Vote = serializer({
  pollId: Poll.fields.id,
  movieId: Movie.fields.id,
  profileId: PublicProfile.fields.id,
  value: fields.constant<-1 | 0 | 1>([-1, 0, 1]),
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),
});

export type Vote = ValueOf<typeof Vote>;

export const Participant = serializer({
  pollId: Poll.fields.id,
  profileId: PublicProfile.fields.id,
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),
});

export type Participant = ValueOf<typeof Participant>;

export const Candidate = serializer({
  pollId: Poll.fields.id,
  movieId: Movie.fields.id,
  profileId: PublicProfile.fields.id,
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),
});

export type Candidate = ValueOf<typeof Candidate>;

export interface DetailedCandidate extends Candidate {
  movie: Movie | null;
  profile: PublicProfile | null;
}

export const Rating = serializer({
  profileId: PublicProfile.fields.id,
  movieId: Movie.fields.id,
  value: fields.nullable(
    fields.integer({
      min: 1,
      max: 10,
    }),
  ),
  createdAt: fields.timestamp(),
  updatedAt: fields.timestamp(),
});

export type Rating = ValueOf<typeof Rating>;

/*
export const RatingUpload = serializer({
  id: idField,
  createdAt: fields.timestamp(),
  profileId: PublicProfile.fields.id,
  form: fields.nested(uploadFormSerializer),
});
*/
