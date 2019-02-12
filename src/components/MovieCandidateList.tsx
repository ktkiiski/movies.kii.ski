import { Typography } from '@material-ui/core';
import { useList, useListOnce } from 'broilerkit/react/api';
import { useUserId } from 'broilerkit/react/auth';
import { order, sort } from 'broilerkit/utils/arrays';
import * as React from 'react';
import * as api from '../api';
import { getMovieScore, usePollRatings } from '../scoring';
import Center from './layout/Center';
import LoadingIndicator from './LoadingIndicator';
import MovieCandidate from './MovieCandidate';

interface MovieCandidateListProps {
    pollId: string;
    sorting: 'unvoted' | 'top';
}

function MovieCandidateList({pollId, sorting}: MovieCandidateListProps) {
    const userId = useUserId();
    const candidates = useList(api.listPollCandidates, {
        pollId,
        ordering: 'createdAt',
        direction: 'asc',
    });
    // NOTE: Only the latest votes affect the ordering
    const votes = useListOnce(api.listPollVotes, {
        pollId,
        ordering: 'createdAt',
        direction: 'asc',
    });
    const participants = useList(api.listPollParticipants, {
        pollId,
        ordering: 'createdAt',
        direction: 'asc',
    });
    const participantIds = participants ? participants.map(({profileId}) => profileId) : [];
    const ratings = usePollRatings(pollId);
    if (!candidates || !votes || !ratings) {
        return <LoadingIndicator />;
    }
    if (!candidates.length) {
        return (
            <Center>
                <Typography>You are ready to suggest movies to this poll!</Typography>
                <Typography>Start typing the movie name to the search field above!</Typography>
            </Center>
        );
    }
    // Calculate score for each movie
    const scoredCandidates = candidates.map((candidate) => ({
        ...candidate,
        score: getMovieScore(candidate.movieId, votes, participantIds),
        ratingCount: ratings.filter((rating) => rating.movieId === candidate.movieId).length,
        votes: votes.filter((vote) => vote.movieId === candidate.movieId),
    }));
    // Sort candidates accordingly
    const sortedCandidates = sorting === 'top'
        // Sort top scored first, secondarily ordered by the rating count
        ? order(
            order(scoredCandidates, 'ratingCount', 'asc'),
            'score', 'desc',
        )
        // Sort unvoted first, secondariy last added first
        : sort(
            order(scoredCandidates, 'createdAt', 'desc'),
            (candidate) => candidate.votes.some((vote) => vote.profileId === userId) ? 1 : 0,
        )
    ;
    return <>{sortedCandidates.map((candidate) => (
        <MovieCandidate key={candidate.movieId} pollId={pollId} candidate={candidate} />
    ))}</>;
}

export default React.memo(MovieCandidateList);
