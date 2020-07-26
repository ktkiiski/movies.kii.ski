import { Collapse, Divider, IconButton, MenuItem } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import MenuIcon from '@material-ui/icons/MoreVert';
import { useList, useOperation } from 'broilerkit/react/api';
import { useRequireAuth, useUserId } from 'broilerkit/react/auth';
import * as React from 'react';
import { useState } from 'react';
import * as api from '../api';
import type { DetailedCandidate } from '../resources';
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

const menuButton = (
  <IconButton>
    <MenuIcon />
  </IconButton>
);

function MovieCandidate({ pollId, candidate }: MovieCandidateProps) {
  const { movie, movieId, profileId, profile } = candidate;
  const [isExpanded, setIsExpanded] = useState(false);
  const userId = useUserId();
  const requireAuth = useRequireAuth();
  const destroyPollCandidate = useOperation(api.destroyPollCandidate);
  const onDestroyClick = async () => {
    const auth = await requireAuth();
    await destroyPollCandidate.delete({ pollId, movieId, profileId: auth.id });
  };
  const voteButtonSet = userId ? (
    <UserVoteButtonSet pollId={pollId} movieId={movieId} userId={userId} />
  ) : (
    <VoteButtonSet pollId={pollId} movieId={movieId} currentValue={null} />
  );
  const hasSeenSelection = userId ? (
    <UserHasSeenMovieSelection movieId={movieId} userId={userId} pollId={pollId} />
  ) : (
    <HasSeenMovieSelection movieId={movieId} hasSeen={false} pollId={pollId} />
  );
  return (
    // TODO: Use classes instead of `style` props for better performance
    <MovieCard movie={movie} key={movieId} profile={profile} content={<VoteResult pollId={pollId} movieId={movieId} />}>
      <CardActions style={{ flexFlow: 'row wrap', justifyContent: 'stretch' }}>
        {voteButtonSet}
        <div style={{ display: 'flex', flexFlow: 'row nowrap', flex: 1 }}>
          <div style={{ flex: 1 }}>{hasSeenSelection}</div>
          {profileId !== userId ? null : (
            <Dropdown button={menuButton} align="right">
              <MenuItem onClick={onDestroyClick}>Remove the movie suggestion</MenuItem>
            </Dropdown>
          )}
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

interface UserVoteButtonSetProps {
  userId: string;
  movieId: number;
  pollId: string;
}

function UserVoteButtonSet({ userId, pollId, movieId }: UserVoteButtonSetProps) {
  const [votes] = useList(
    api.listPollVotes,
    { pollId, ordering: 'createdAt', direction: 'asc' },
    { movieId, profileId: userId },
  );
  const currentValue = votes && votes.length ? votes[0].value : null;
  return <VoteButtonSet movieId={movieId} pollId={pollId} currentValue={currentValue} />;
}

interface UserHasSeenMovieSelectionProps {
  movieId: number;
  userId: string;
  pollId: string;
}

function UserHasSeenMovieSelection({ movieId, userId, pollId }: UserHasSeenMovieSelectionProps) {
  const [ratings] = useList(
    api.listPollRatings,
    { pollId, ordering: 'createdAt', direction: 'asc' },
    { movieId, profileId: userId },
  );
  if (!ratings) {
    return null;
  }
  return <HasSeenMovieSelection movieId={movieId} hasSeen={ratings.length > 0} pollId={pollId} />;
}

export default React.memo(MovieCandidate);
