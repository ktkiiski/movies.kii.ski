import { Typography } from '@material-ui/core';
import { ObserverComponent } from 'broilerkit/react/observer';
import { order, sort } from 'broilerkit/utils/arrays';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { api, authClient } from '../client';
import { DetailedCandidate, Vote } from '../resources';
import { getMovieScore, getParticipantIds, getPollRatings$ } from '../scoring';
import Center from './Center';
import LoadingIndicator from './LoadingIndicator';
import MovieCandidate from './MovieCandidate';

interface MovieCandidateListProps {
    pollId: string;
    sorting: 'unvoted' | 'top';
}

interface ScoredCandidate extends DetailedCandidate {
    score: number;
    ratingCount: number;
    votes: Vote[];
}

interface MovieCandidateListState {
    candidates: ScoredCandidate[];
    userId: string | null;
}

class MovieCandidateList extends ObserverComponent<MovieCandidateListProps, MovieCandidateListState> {

    public state$ = combineLatest(this.props$, authClient.userId$).pipe(
        switchMap(([{pollId, sorting}, userId]) => combineLatest(
            api.pollCandidateCollection.observeAll({
                pollId,
                ordering: 'createdAt',
                direction: 'asc',
            }),
            getPollRatings$(pollId),
            // Only the latest votes affect the ordering
            api.pollVoteCollection.observeAll({
                pollId,
                ordering: 'createdAt',
                direction: 'asc',
            }).pipe(first()),
            (candidates, ratings, votes) => {
                const participantIds = getParticipantIds(candidates, votes);
                // Calculate score for each movie
                const scoredCandidates = candidates.map((candidate) => ({
                    ...candidate,
                    score: getMovieScore(candidate.movieId, votes, participantIds),
                    ratingCount: ratings.filter((rating) => rating.movieId === candidate.movieId).length,
                    votes: votes.filter((vote) => vote.movieId === candidate.movieId),
                } as ScoredCandidate));
                return {
                    userId,
                    candidates: sorting === 'top'
                        // Sort top scored first, secondarily ordered by the rating count
                        ? order(
                            order(scoredCandidates, 'ratingCount', 'asc'),
                            'score', 'desc',
                        )
                        // Sort unvoted first, secondariy last added first
                        : sort(
                            order(scoredCandidates, 'createdAt', 'desc'),
                            (candidate) => candidate.votes.some((vote) => vote.profileId === userId) ? 1 : 0,
                        ),
                };
            },
        )),
    );

    public onRemoveItemClick = (pollId: string, movieId: number) => {
        api.pollCandidateResource.deleteWithUser({movieId, pollId});
    }

    public render() {
        const {pollId} = this.props;
        const {candidates} = this.state;
        if (!candidates) {
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
        return candidates.map((candidate) => (
            <MovieCandidate key={candidate.movieId} pollId={pollId} candidate={candidate} />
        ));
    }
}

export default MovieCandidateList;
