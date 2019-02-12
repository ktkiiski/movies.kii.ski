import { Collapse, Divider, IconButton, MenuItem } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import MenuIcon from '@material-ui/icons/MoreVert';
import { useOperation } from 'broilerkit/react/api';
import { useUserId } from 'broilerkit/react/auth';
import * as React from 'react';
import { useState } from 'react';
import * as api from '../api';
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

const menuButton = <IconButton><MenuIcon/></IconButton>;

function MovieCandidate({pollId, candidate}: MovieCandidateProps) {
    const {movie, movieId, profileId, profile} = candidate;
    const [isExpanded, setIsExpanded] = useState(false);
    const userId = useUserId();
    const destroyPollCandidate = useOperation(api.destroyPollCandidate, (op) => (
        op.deleteWithUser({pollId, movieId})
    ));
    return (
        <MovieCard movie={movie} key={movieId} profile={profile} content={
            <VoteResult pollId={pollId} movieId={movieId} />
        }>
            <CardActions style={{flexFlow: 'row wrap', justifyContent: 'stretch'}}>
                <VoteButtonSet pollId={pollId} movieId={movieId} />
                <div style={{display: 'flex', flexFlow: 'row nowrap', flex: 1}}>
                    <HasSeenMovieSelection style={{flex: 1}} movieId={movieId} />
                    {profileId !== userId ? null : <Dropdown button={menuButton} align='right'>
                        <MenuItem onClick={destroyPollCandidate}>
                            Remove the movie suggestion
                        </MenuItem>
                    </Dropdown>}
                    <IconButton onClick={() => setIsExpanded(!isExpanded)}>
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

export default MovieCandidate;
