import { Hidden, Typography } from '@material-ui/core';
import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import { getMovieScore } from '../scoring';
import VotePie from './VotePie';

interface VoteTableProps {
  pollId: string;
  movieId: number;
}

function VoteResult({ pollId, movieId }: VoteTableProps) {
  const [movieVotes] = useList(api.listPollVotes, {
    pollId, ordering: 'createdAt', direction: 'asc',
  }, {
    movieId,
  });
  const [pollParticipants] = useList(api.listPollParticipants, {
    pollId, ordering: 'createdAt', direction: 'asc',
  });
  const [movieRatings] = useList(
    api.listPollRatings,
    { pollId, ordering: 'createdAt', direction: 'asc' },
    { movieId },
  );
  if (movieVotes == null || pollParticipants == null || movieRatings == null) {
    return null;
  }
  const participantIds = pollParticipants.map(({ profileId }) => profileId);
  const score = getMovieScore(movieId, movieVotes, participantIds);
  const participantCount = pollParticipants.length;

  return <>
    <Hidden xsDown implementation='js'>
      <VotePie size={120} votes={movieVotes} maxCount={participantCount} ratings={movieRatings} animate>
        {isFinite(score) ? <Typography color='textPrimary' style={{ fontSize: 24 }}>{Math.round(score)}%</Typography> : null}
      </VotePie>
    </Hidden>
    <Hidden smUp implementation='js'>
      <VotePie size={64} votes={movieVotes} maxCount={participantCount} ratings={movieRatings} animate>
        {isFinite(score) ? <Typography color='textPrimary' style={{ fontSize: 15 }}>{Math.round(score)}%</Typography> : null}
      </VotePie>
    </Hidden>
  </>;
}

export default React.memo(VoteResult);
