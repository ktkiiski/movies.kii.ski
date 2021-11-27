import { Hidden, Typography } from '@material-ui/core';
import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import { getMovieScore } from '../scoring';
import VoteCountPie from './VoteCountPie';

interface VoteTableProps {
  pollId: string;
  movieId: number;
}

function VoteResult({ pollId, movieId }: VoteTableProps) {
  const [movieVotes] = useList(
    api.listPollVotes,
    {
      pollId,
      ordering: 'createdAt',
      direction: 'asc',
    },
    {
      movieId,
    },
  );
  const [pollParticipants] = useList(api.listPollParticipants, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const [movieRatings] = useList(api.listPollRatings, { pollId, ordering: 'createdAt', direction: 'asc' }, { movieId });
  if (movieVotes == null || pollParticipants == null || movieRatings == null) {
    return null;
  }
  const participantIds = pollParticipants.map(({ profileId }) => profileId);
  const score = getMovieScore(movieId, movieVotes, participantIds);
  const participantCount = pollParticipants.length;
  const positiveVoteCount = movieVotes.filter(({ value }) => value === 1).length;
  const neutralVoteCount = movieVotes.filter(({ value }) => value === 0).length;
  const negativeVoteCount = movieVotes.filter(({ value }) => value === -1).length;

  return (
    <>
      <Hidden xsDown implementation="js">
        <VoteCountPie
          size={120}
          positiveVoteCount={positiveVoteCount}
          neutralVoteCount={neutralVoteCount}
          negativeVoteCount={negativeVoteCount}
          maxCount={participantCount}
          ratings={movieRatings}
          animate
        >
          {Number.isFinite(score) ? (
            <Typography color="textPrimary" style={{ fontSize: 24 }}>
              {`${Math.round(score)}%`}
            </Typography>
          ) : null}
        </VoteCountPie>
      </Hidden>
      <Hidden smUp implementation="js">
        <VoteCountPie
          size={64}
          positiveVoteCount={positiveVoteCount}
          neutralVoteCount={neutralVoteCount}
          negativeVoteCount={negativeVoteCount}
          maxCount={participantCount}
          ratings={movieRatings}
          animate
        >
          {Number.isFinite(score) ? (
            <Typography color="textPrimary" style={{ fontSize: 15 }}>
              {`${Math.round(score)}%`}
            </Typography>
          ) : null}
        </VoteCountPie>
      </Hidden>
    </>
  );
}

export default React.memo(VoteResult);
