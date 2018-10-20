import { Collapse, Divider, IconButton, MenuItem } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import MenuIcon from '@material-ui/icons/MoreVert';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { map } from 'rxjs/operators';
import { api, authClient } from '../client';
import { DetailedCandidate } from '../resources';
import Dropdown from './Dropdown';
import HasSeenMovieSelection from './HasSeenMovieSelection';
import ExpandIcon from './icons/ExpandIcon';
import MovieCard from './MovieCard';
import VoteButtonSet from './VoteButtonSet';
import VoteResult from './VoteResult';
import VoteTable from './VoteTable';

interface MovieCandidateProps {
    pollId: string;
    candidate: DetailedCandidate;
}

interface MovieCandidateState {
    userId: string | null;
}

interface MovieCandidateUIState {
    isExpanded: boolean;
}

const menuButton = <IconButton><MenuIcon/></IconButton>;

class MovieCandidate extends ObserverComponent<MovieCandidateProps, MovieCandidateState, MovieCandidateUIState> {

    public state: Partial<MovieCandidateState> & MovieCandidateUIState = {
        isExpanded: false,
    };

    public state$ = authClient.userId$.pipe(
        map((userId) => ({userId})),
    );

    public onRemoveItemClick = () => {
        const {candidate: {movieId}, pollId} = this.props;
        api.pollCandidateResource.deleteWithUser({movieId, pollId});
    }

    public onToggle = () => {
        const {isExpanded} = this.state;
        this.setState({isExpanded: !isExpanded});
    }

    public render() {
        const {pollId, candidate} = this.props;
        const {movie, movieId, profileId, profile} = candidate;
        const {userId, isExpanded} = this.state;
        return (
            <MovieCard movie={movie} key={movieId} profile={profile} content={
                <VoteResult pollId={pollId} movieId={movieId} />
            }>
                <CardActions style={{flexFlow: 'row wrap', justifyContent: 'stretch'}}>
                    <VoteButtonSet pollId={pollId} movieId={movieId} />
                    <div style={{display: 'flex', flexFlow: 'row nowrap', flex: 1}}>
                        <HasSeenMovieSelection style={{flex: 1}} movieId={movieId} />
                        {profileId !== userId ? null : <Dropdown button={menuButton} align='right'>
                            <MenuItem onClick={this.onRemoveItemClick}>
                                Remove the movie suggestion
                            </MenuItem>
                        </Dropdown>}
                        <IconButton onClick={this.onToggle}>
                            <ExpandIcon up={isExpanded} />
                        </IconButton>
                    </div>
                </CardActions>
                <Collapse in={isExpanded}>
                    <Divider />
                    <VoteTable movieId={movieId} pollId={pollId} />
                </Collapse>
            </MovieCard>
        );
    }
}

export default MovieCandidate;
