import { boolean, choice, constant, date, datetime, decimal, id, integer, list, matching, nullable, number, string, text, url } from 'broilerkit/fields';
import { Deserialization, resource } from 'broilerkit/resources';
import { users } from 'broilerkit/users';

export const profiles = resource('profile')
  .fields({
    id: users.fields.id,
    name: nullable(users.fields.name),
    email: nullable(users.fields.email),
    picture: users.fields.picture,
    groups: list(string()),
    version: id(),
  })
  .identifyBy(['id'], 'version');

export const publicProfiles = profiles
  .subset(['id', 'name', 'picture']);

export type PublicProfile = Deserialization<typeof publicProfiles>;

export const movies = resource('movie')
  .fields({
    id: integer(),
    version: id(),
    createdAt: datetime(),
    updatedAt: datetime(),

    type: choice(['movie', 'series']),

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
  })
  .identifyBy(['id'], 'version');

export type Movie = Deserialization<typeof movies>;

export const movieSearchResults = resource('movieSearchResult')
  .fields({
    id: integer(),
    query: string(),
    index: integer(),
  })
  .identifyBy(['id']);

export type MovieSearchResult = Deserialization<typeof movieSearchResults>;

export const polls = resource('poll')
  .fields({
    id: id(),
    version: id(),
    title: string(),
    description: text(),
    profileId: profiles.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
    candidateCount: integer(),
    participantCount: integer(),
    voteCount: integer(),
  })
  .identifyBy(['id'], 'version');

export const participants = resource('participant')
  .fields({
    version: id(),
    pollId: polls.fields.id,
    profileId: publicProfiles.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
    voteCount: integer(),
    positiveVoteCount: integer(),
    neutralVoteCount: integer(),
    negativeVoteCount: integer(),
  })
  .identifyBy(['pollId', 'profileId'], 'version');

export const pollParticipants = participants
  .nest('profile', publicProfiles, { id: 'profileId' });

export const candidates = resource('candidate')
  .fields({
    version: id(),
    pollId: polls.fields.id,
    movieId: movies.fields.id,
    profileId: profiles.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy(['pollId', 'movieId'], 'version');

export const pollCandidates = candidates
  .nest('movie', movies, { id: 'movieId' })
  .nest('profile', publicProfiles, { id: 'profileId' });

export type Candidate = Deserialization<typeof candidates>;

export interface DetailedCandidate extends Candidate {
  movie: Movie | null;
  profile: PublicProfile | null;
}

export const votes = resource('vote')
  .fields({
    version: id(),
    pollId: polls.fields.id,
    movieId: movies.fields.id,
    profileId: profiles.fields.id,
    value: constant([-1, 0, 1]),
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy(['pollId', 'movieId', 'profileId'], 'version');

export const pollVotes = votes
  .nest('profile', publicProfiles, { id: 'profileId' });

export type Vote = Deserialization<typeof votes>;

export const ratings = resource('rating')
  .fields({
    version: id(),
    profileId: profiles.fields.id,
    movieId: movies.fields.id,
    value: nullable(integer({
      min: 1,
      max: 10,
    })),
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy(['profileId', 'movieId'], 'version');

export const userRatings = ratings
  .nest('movie', movies, { id: 'movieId' });

export type Rating = Deserialization<typeof ratings>;

export const pollRatings = ratings
  .join(participants, { profileId: 'profileId' }, { pollId: 'pollId' })
  .join(candidates, { movieId: 'movieId', pollId: 'pollId' }, {})
  .nest('profile', publicProfiles, { id: 'profileId' });

export const ratingUploads = resource('ratingUpload')
  .fields({
    id: id(),
    createdAt: datetime(),
    profileId: profiles.fields.id,
    ratingCount: integer(),
  })
  .identifyBy(['id']);
