import { order, union } from 'broilerkit/utils/arrays';
import { isEqual, isNotNully } from 'broilerkit/utils/compare';
import { combineLatest, concat } from 'rxjs';
import { distinct, distinctUntilChanged, filter, map, switchMap, toArray } from 'rxjs/operators';
import { api } from './client';
import { Candidate, DetailedRating, Vote } from './resources';

export function getMovieScore(movieId: number, votes: Vote[], participantIds: string[]) {
    const totalValue = votes.reduce((sum, vote) => sum + (vote.movieId === movieId ? vote.value : 0), 0);
    const participantCount = participantIds.length;
    const minScore = -participantCount;
    const maxScore = participantCount;
    return 100 * (totalValue - minScore) / (maxScore - minScore);
}

export function getParticipantIds(candidates: Candidate[], votes: Vote[]): string[] {
    const voterIds = votes.map((vote) => vote.profileId);
    const candidateUserIds = candidates.map((candidate) => candidate.profileId);
    return union(voterIds, candidateUserIds);
}

export function getPollRatings$(pollId: string) {
    const candidates$ = api.pollCandidateCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'});
    const votes$ = api.pollVoteCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'});
    return combineLatest(candidates$, votes$).pipe(
        switchMap(([candidates, votes]) => (
            concat(candidates, votes).pipe(
                map((item) => item.profile),
                filter(isNotNully),
                distinct((participant) => participant.id),
                toArray(),
            )
        )),
        map((participants) => order(participants, 'id', 'asc')),
        distinctUntilChanged(isEqual),
        switchMap((participants) => !participants.length ? [[]] : combineLatest(
            participants.map((profile) => api.userRatingCollection.observeAll({
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
