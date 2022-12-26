import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { Serializer } from 'serializers';
import { Candidate, Movie, Participant, Poll, PublicProfile, Rating, Vote } from './resources';

function makeConverter<Data>(serializer: Serializer<Data>): FirestoreDataConverter<Data> {
  return {
    toFirestore(input: Data): DocumentData {
      return serializer.serialize(input);
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Data {
      const data = snapshot.data();
      return serializer.deserialize(data);
    },
  };
}

export const profileConverter = makeConverter(PublicProfile);
export const movieConverter = makeConverter(Movie);
export const pollConverter = makeConverter(Poll);
export const voteConverter = makeConverter(Vote);
export const participantConverter = makeConverter(Participant);
export const candidateConverter = makeConverter(Candidate);
export const ratingConverter = makeConverter(Rating);
