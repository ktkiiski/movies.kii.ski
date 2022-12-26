import { FirestoreError, orderBy, query } from 'firebase/firestore';
import getUserRatingsRef from '../references/getUserRatingsRef';
import { Rating } from '../resources';
import useMultipleQueries from './useMultipleQueries';
import usePollParticipants from './usePollParticipants';

export default function usePollRatings(pollId: string): [Rating[], boolean, FirestoreError | undefined] {
  const [participants, isLoadingParticipants, participantsError] = usePollParticipants(pollId);
  const ratingQueries = participants.map((participant) => {
    const collectionRef = getUserRatingsRef(participant);
    return query(collectionRef, orderBy('createdAt', 'asc'));
  });
  const [ratings, isLoadingRatings, ratingsError] = useMultipleQueries(ratingQueries);
  return [ratings, isLoadingParticipants || isLoadingRatings, participantsError || ratingsError];
}
