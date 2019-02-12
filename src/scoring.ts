import { useList, useListMany } from 'broilerkit/react/api';
import { flatten } from 'broilerkit/utils/arrays';
import * as api from './api';
import { Vote } from './resources';

export function getMovieScore(movieId: number, votes: Vote[], participantIds: string[]) {
    const totalValue = votes.reduce((sum, vote) => sum + (vote.movieId === movieId ? vote.value : 0), 0);
    const participantCount = participantIds.length;
    const minScore = -participantCount;
    const maxScore = participantCount;
    return 100 * (totalValue - minScore) / (maxScore - minScore);
}

export function usePollRatings(pollId: string, movieId?: number) {
    const participants = useList(api.listPollParticipants, {
        pollId, ordering: 'createdAt', direction: 'asc',
    }) || [];
    const participantIds = participants.map(({profileId}) => profileId);
    const ratingLists = useListMany(api.listUserRatings, participantIds.map((profileId) => ({
        profileId,
        ordering: 'createdAt' as 'createdAt',
        direction: 'asc' as 'asc',
    })));
    if (!ratingLists) {
        return null;
    }
    const ratings = flatten(ratingLists.map((profileRatings, index) => profileRatings.map((rating) => ({
        ...rating,
        profile: participants[index].profile,
    }))));
    if (movieId == null) {
        return ratings;
    }
    return ratings.filter((rating) => rating.movieId === movieId);
}
