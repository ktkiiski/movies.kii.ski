import { boolean, choice, constant, date, datetime, decimal, id, integer, list, matching, nullable, number, string, text, url } from 'broilerkit/fields';
import { Deserialization, resource } from 'broilerkit/resources';
import { nested } from 'broilerkit/serializers';
import { uploadFormSerializer } from 'broilerkit/uploads';
import { users } from 'broilerkit/users';

export const Profile = resource('profile')
  .fields({
    id: users.fields.id,
    name: users.fields.name,
    email: users.fields.email,
    picture: users.fields.picture,
    groups: list(string()),
  })
  .identifyBy('id');

export const PublicProfile = Profile
  .subset(['id', 'name', 'picture']);

export type PublicProfile = Deserialization<typeof PublicProfile>;

export const Movie = resource('movie')
  .fields({
    id: integer(),
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
  .identifyBy('id');

export type Movie = Deserialization<typeof Movie>;

export const MovieSearchResult = resource('movieSearchResult')
  .fields({
    id: integer(),
    query: string(),
    index: integer(),
  })
  .identifyBy('id');

export type MovieSearchResult = Deserialization<typeof MovieSearchResult>;

export const BasePoll = resource('poll')
  .fields({
    id: id(),
    title: string(),
    description: text(),
    profileId: Profile.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy('id');

export const PollCandidateCounter = resource('pollCandidateCounter')
  .fields({
    pollId: BasePoll.fields.id,
    count: integer(),
  })
  .identifyBy('pollId');

export const PollParticipantCounter = resource('pollParticipantCounter')
  .fields({
    pollId: BasePoll.fields.id,
    count: integer(),
  })
  .identifyBy('pollId');

export const PollVoteCounter = resource('pollVoteCounter')
  .fields({
    pollId: BasePoll.fields.id,
    count: integer(),
  })
  .identifyBy('pollId');

export const Poll = BasePoll
  .leftJoin(PollCandidateCounter, { pollId: 'id' }, { candidateCount: 'count' }, { candidateCount: 0 })
  .leftJoin(PollParticipantCounter, { pollId: 'id' }, { participantCount: 'count' }, { participantCount: 0 })
  .leftJoin(PollVoteCounter, { pollId: 'id' }, { voteCount: 'count' }, { voteCount: 0 });

export const Vote = resource('vote')
  .fields({
    pollId: Poll.fields.id,
    movieId: Movie.fields.id,
    profileId: Profile.fields.id,
    value: constant([-1, 0, 1]),
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy('pollId', 'movieId', 'profileId');

export const PollVote = Vote
  .nest('profile', PublicProfile, { id: 'profileId' });

export type Vote = Deserialization<typeof Vote>;

export const Participant = resource('participant')
  .fields({
    pollId: Poll.fields.id,
    profileId: PublicProfile.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy('pollId', 'profileId');

export const ParticipantVoteCounter = resource('participantVoteCounter')
  .fields({
    pollId: Poll.fields.id,
    profileId: PublicProfile.fields.id,
    count: integer(),
  })
  .identifyBy('pollId', 'profileId');

export const ParticipantVoteValueCounter = resource('participantVoteValueCounter')
  .fields({
    pollId: Poll.fields.id,
    profileId: PublicProfile.fields.id,
    value: Vote.fields.value,
    count: integer(),
  })
  .identifyBy('pollId', 'profileId', 'value');

export const PollParticipant = Participant
  .nest('profile', PublicProfile, { id: 'profileId' })
  .leftJoin(
    ParticipantVoteCounter,
    { pollId: 'pollId', profileId: 'profileId' },
    { voteCount: 'count' },
    { voteCount: 0 },
  )
  .leftJoin(
    ParticipantVoteValueCounter,
    { pollId: 'pollId', profileId: 'profileId', value: { value: 1 } },
    { positiveVoteCount: 'count' },
    { positiveVoteCount: 0 },
  )
  .leftJoin(
    ParticipantVoteValueCounter,
    { pollId: 'pollId', profileId: 'profileId', value: { value: 0 } },
    { neutralVoteCount: 'count' },
    { neutralVoteCount: 0 },
  )
  .leftJoin(
    ParticipantVoteValueCounter,
    { pollId: 'pollId', profileId: 'profileId', value: { value: -1 } },
    { negativeVoteCount: 'count' },
    { negativeVoteCount: 0 },
  );

export const Candidate = resource('candidate')
  .fields({
    pollId: Poll.fields.id,
    movieId: Movie.fields.id,
    profileId: Profile.fields.id,
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy('pollId', 'movieId');

export const PollCandidate = Candidate
  .nest('movie', Movie, { id: 'movieId' })
  .nest('profile', PublicProfile, { id: 'profileId' });

export type Candidate = Deserialization<typeof Candidate>;

export interface DetailedCandidate extends Candidate {
  movie: Movie | null;
  profile: PublicProfile | null;
}

export const Rating = resource('rating')
  .fields({
    profileId: Profile.fields.id,
    movieId: Movie.fields.id,
    value: nullable(integer({
      min: 1,
      max: 10,
    })),
    createdAt: datetime(),
    updatedAt: datetime(),
  })
  .identifyBy('profileId', 'movieId');

export const UserRating = Rating
  .nest('movie', Movie, { id: 'movieId' });

export type Rating = Deserialization<typeof Rating>;

export const PollRating = Rating
  .join(Participant, { profileId: 'profileId' }, { pollId: 'pollId' })
  .join(Candidate, { movieId: 'movieId', pollId: 'pollId' }, {})
  .nest('profile', PublicProfile, { id: 'profileId' });

export const RatingUpload = resource('ratingUpload')
  .fields({
    id: id(),
    createdAt: datetime(),
    profileId: Profile.fields.id,
    form: nested(uploadFormSerializer),
  })
  .identifyBy('id');
