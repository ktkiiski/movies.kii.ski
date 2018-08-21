import { Typography } from '@material-ui/core';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { api } from '../client';
import { Rating, Vote } from '../resources';
import { getMovieScore, getParticipantIds, getPollRatings$ } from '../scoring';
import VotePie from './VotePie';

interface VoteTableProps {
    pollId: string;
    movieId: number;
}

interface VoteTableState {
    movieVotes: Vote[];
    participantIds: string[];
    score: number;
    movieRatings: Rating[];
}

class VoteResult extends ObserverComponent<VoteTableProps, VoteTableState> {

    public state$ = this.props$.pipe(
        switchMap(({pollId, movieId}) => combineLatest(
            api.pollVoteCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'}),
            api.pollCandidateCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'}),
            getPollRatings$(pollId),
            (votes, candidates, ratings) => {
                const participantIds = getParticipantIds(candidates, votes);
                const movieVotes = votes.filter((vote) => vote.movieId === movieId);
                const movieRatings = ratings.filter((rating) => rating.movieId === movieId);
                const score = getMovieScore(movieId, votes, participantIds);
                return {score, movieVotes, participantIds, movieRatings};
            },
        )),
    );

    public render() {
        const {score, movieVotes, movieRatings, participantIds} = this.state;
        if (score == null || movieVotes == null || participantIds == null || movieRatings == null) {
            return null;
        }
        return <VotePie size={120} votes={movieVotes} maxCount={participantIds.length} ratings={movieRatings}>
            {isFinite(score) ? <Typography style={{fontSize: 24}}>{score}%</Typography> : null}
        </VotePie>;
    }
}

export default VoteResult;
