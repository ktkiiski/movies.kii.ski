import { union } from 'broilerkit/utils/arrays';
import { isEqual } from 'broilerkit/utils/compare';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { api } from './client';
import { Candidate, Rating, Vote } from './resources';

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
    return combineLatest(candidates$, votes$, getParticipantIds).pipe(
        map((participantIds) => [...participantIds].sort()),
        distinctUntilChanged(isEqual),
        switchMap((participantIds) => combineLatest(
            participantIds.map((profileId) => api.userRatingCollection.observeAll({
                profileId, ordering: 'createdAt', direction: 'asc',
            })),
        )),
        map((ratingCollections) => new Array<Rating>().concat(...ratingCollections)),
    );
}
