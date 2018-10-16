import { Hidden, Typography } from '@material-ui/core';
import { ObserverComponent } from 'broilerkit/react/observer';
import { isEqual } from 'broilerkit/utils/compare';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
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
    participantCount: number;
    score: number;
    movieRatings: Rating[];
}

class VoteResult extends ObserverComponent<VoteTableProps, VoteTableState> {

    public votes$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollVoteCollection.observeAll({
            pollId, ordering: 'createdAt', direction: 'asc',
        })),
    );
    public candidates$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollCandidateCollection.observeAll({
            pollId, ordering: 'createdAt', direction: 'asc',
        })),
    );
    public participantId$ = combineLatest(
        this.votes$, this.candidates$, (votes, candidates) => getParticipantIds(candidates, votes),
    ).pipe(
        distinctUntilChanged(isEqual),
    );
    public ratings$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => getPollRatings$(pollId)),
    );
    public movieRatings$ = combineLatest(
        this.ratings$, this.pluckProp('movieId'),
        (ratings, movieId) => ratings.filter((rating) => rating.movieId === movieId),
    ).pipe(
        distinctUntilChanged(isEqual),
    );
    public movieVotes$ = combineLatest(
        this.votes$, this.pluckProp('movieId'),
        (votes, movieId) => votes.filter((vote) => vote.movieId === movieId),
    ).pipe(
        distinctUntilChanged(isEqual),
    );
    public score$ = combineLatest(
        this.pluckProp('movieId'),
        this.movieVotes$,
        this.participantId$,
        getMovieScore,
    ).pipe(
        distinctUntilChanged(),
    );
    public participantCount$ = this.participantId$.pipe(
        map((participantIds) => participantIds.length),
        distinctUntilChanged(),
    );

    public state$ = combineLatest(
        this.score$, this.movieVotes$, this.participantCount$, this.movieRatings$,
        (score, movieVotes, participantCount, movieRatings) => ({
            score, movieVotes, participantCount, movieRatings,
        }),
    );

    public render() {
        const {score, movieVotes, movieRatings, participantCount} = this.state;
        if (score == null || movieVotes == null || participantCount == null || movieRatings == null) {
            return null;
        }
        return <>
            <Hidden xsDown implementation='js'>
                <VotePie size={120} votes={movieVotes} maxCount={participantCount} ratings={movieRatings}>
                {isFinite(score) ? <Typography style={{fontSize: 24}}>{Math.round(score)}%</Typography> : null}
                </VotePie>
            </Hidden>
            <Hidden smUp implementation='js'>
                <VotePie size={75} votes={movieVotes} maxCount={participantCount} ratings={movieRatings}>
                {isFinite(score) ? <Typography style={{fontSize: 20}}>{Math.round(score)}%</Typography> : null}
                </VotePie>
            </Hidden>
        </>;
    }
}

export default VoteResult;
