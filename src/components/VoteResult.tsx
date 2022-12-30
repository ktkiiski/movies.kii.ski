import { Theme, Typography, useMediaQuery } from '@mui/material';
import * as React from 'react';
import usePollParticipants from '../hooks/usePollParticipants';
import usePollRatings from '../hooks/usePollRatings';
import usePollVotes from '../hooks/usePollVotes';
import { getMovieScore } from '../scoring';
import VoteCountPie from './VoteCountPie';

interface VoteTableProps {
  pollId: string;
  movieId: number;
}

function VoteResult({ pollId, movieId }: VoteTableProps) {
  const smallCountPie = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const [pollVotes] = usePollVotes(pollId);
  const movieVotes = pollVotes.filter((vote) => vote.movieId === movieId);
  const [pollParticipants] = usePollParticipants(pollId);
  const [pollRatings] = usePollRatings(pollId);
  const movieRatings = pollRatings.filter((rating) => rating.movieId === movieId);
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
    <VoteCountPie
      size={smallCountPie ? 64 : 120}
      positiveVoteCount={positiveVoteCount}
      neutralVoteCount={neutralVoteCount}
      negativeVoteCount={negativeVoteCount}
      maxCount={participantCount}
      ratings={movieRatings}
      animate
    >
      {Number.isFinite(score) ? (
        <Typography color="textPrimary" style={{ fontSize: smallCountPie ? 15 : 24 }}>
          {`${Math.round(score)}%`}
        </Typography>
      ) : null}
    </VoteCountPie>
  );
}

export default React.memo(VoteResult);
