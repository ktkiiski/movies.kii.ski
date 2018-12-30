import { Hidden, Typography } from '@material-ui/core';
import { ObserverComponent } from 'broilerkit/react/observer';
import { isEqual } from 'broilerkit/utils/compare';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { api } from '../client';
import { Rating, Vote } from '../resources';
import { getMovieScore, getPollRatings$ } from '../scoring';
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

    public movieVotes$ = this.props$.pipe(
        switchMap(({pollId, movieId}) => api.pollVoteCollection.observeAll({
            pollId, ordering: 'createdAt', direction: 'asc',
        }, {
            movieId,
        })),
    );
    public participants$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollParticipantCollection.observeAll({
            pollId, ordering: 'createdAt', direction: 'asc',
        })),
    );
    public participantId$ = this.participants$.pipe(
        map((participants) => participants.map(({profileId}) => profileId)),
        distinctUntilChanged(isEqual),
    );
    public movieRatings$ = this.props$.pipe(
        switchMap(({pollId, movieId}) => getPollRatings$(pollId, movieId)),
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
