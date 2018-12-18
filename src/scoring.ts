import { isNotNully } from 'broilerkit/utils/compare';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { api } from './client';
import { DetailedRating, Vote } from './resources';

export function getMovieScore(movieId: number, votes: Vote[], participantIds: string[]) {
    const totalValue = votes.reduce((sum, vote) => sum + (vote.movieId === movieId ? vote.value : 0), 0);
    const participantCount = participantIds.length;
    const minScore = -participantCount;
    const maxScore = participantCount;
    return 100 * (totalValue - minScore) / (maxScore - minScore);
}

export function getPollRatings$(pollId: string) {
    const participants$ = api.pollParticipantCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'});
    return participants$.pipe(
        switchMap((participants) => !participants.length ? [[]] : combineLatest(
            participants
                .map(({profile}) => profile)
                .filter(isNotNully)
                .map((profile) => api.userRatingCollection.observeAll({
                    profileId: profile.id,
                    ordering: 'createdAt',
                    direction: 'asc',
                }).pipe(
                    map((ratings) => ratings.map((rating) => ({...rating, profile}))),
                )),
        )),
        map((ratingCollections) => new Array<DetailedRating>().concat(...ratingCollections)),
    );
}
