import { Hidden, Typography } from '@material-ui/core';
import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import { getMovieScore, usePollRatings } from '../scoring';
import VotePie from './VotePie';

interface VoteTableProps {
    pollId: string;
    movieId: number;
}

function VoteResult({pollId, movieId}: VoteTableProps) {
    const pollVotes = useList(api.listPollVotes, {
        pollId, ordering: 'createdAt', direction: 'asc',
    });
    const pollParticipants = useList(api.listPollParticipants, {
        pollId, ordering: 'createdAt', direction: 'asc',
    });
    const movieRatings = usePollRatings(pollId, movieId);
    if (pollVotes == null || pollParticipants == null || movieRatings == null) {
        return null;
    }
    const movieVotes = pollVotes.filter((vote) => vote.movieId === movieId);
    const participantIds = pollParticipants.map(({profileId}) => profileId);
    const score = getMovieScore(movieId, pollVotes, participantIds);
    const participantCount = pollParticipants.length;

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

export default React.memo(VoteResult);
