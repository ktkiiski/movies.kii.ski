import { IconButton, MenuItem } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import MenuIcon from '@material-ui/icons/MoreVert';
import { ObserverComponent } from 'broilerkit/react/observer';
import { order, sort } from 'broilerkit/utils/arrays';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { api, authClient } from '../client';
import { DetailedCandidate, Vote } from '../resources';
import { getMovieScore, getParticipantIds, getPollRatings$ } from '../scoring';
import Dropdown from './Dropdown';
import HasSeenMovieSelection from './HasSeenMovieSelection';
import LoadingIndicator from './LoadingIndicator';
import MovieCard from './MovieCard';
import VoteButtonSet from './VoteButtonSet';
import VoteResult from './VoteResult';

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

const menuButton = <IconButton style={{marginLeft: 'auto'}}><MenuIcon/></IconButton>;

class MovieCandidateList extends ObserverComponent<MovieCandidateListProps, MovieCandidateListState> {

    public state$ = combineLatest(this.props$, authClient.userId$).pipe(
        switchMap(([{pollId, sorting}, userId]) => combineLatest(
            api.pollCandidateCollection.observeAll({
                pollId,
                ordering: 'createdAt',
                direction: 'desc',
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
        const {candidates, userId} = this.state;
        if (!candidates) {
            return <LoadingIndicator />;
        }
        return candidates.map(({movie, movieId, profileId, profile}) => (
            <MovieCard movie={movie} key={movieId} profile={profile} content={
                <VoteResult pollId={pollId} movieId={movieId} />
            }>
                <CardActions style={{flexFlow: 'row wrap', justifyContent: 'stretch'}}>
                    <VoteButtonSet pollId={pollId} movieId={movieId} />
                    <div style={{display: 'flex', flexFlow: 'row nowrap', flex: 1}}>
                        <HasSeenMovieSelection movieId={movieId} />
                        {profileId !== userId ? null : <Dropdown button={menuButton} align='right'>
                            <MenuItem onClick={() => this.onRemoveItemClick(pollId, movieId)}>
                                Remove the movie suggestion
                            </MenuItem>
                        </Dropdown>}
                    </div>
                </CardActions>
            </MovieCard>
        ));
    }
}

export default MovieCandidateList;
