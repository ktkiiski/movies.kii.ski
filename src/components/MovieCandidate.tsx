import { Collapse, Divider, IconButton, MenuItem } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import MenuIcon from '@material-ui/icons/MoreVert';
import { useList, useOperation } from 'broilerkit/react/api';
import { useRequireAuth, useUserId } from 'broilerkit/react/auth';
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

const menuButton = <IconButton><MenuIcon /></IconButton>;

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
  const voteButtonSet = userId
    ? <UserVoteButtonSet pollId={pollId} movieId={movieId} userId={userId} />
    : <VoteButtonSet pollId={pollId} movieId={movieId} currentValue={null} />
    ;
  const hasSeenSelection = userId
    ? <UserHasSeenMovieSelection movieId={movieId} userId={userId} />
    : <HasSeenMovieSelection movieId={movieId} hasSeen={false} />
    ;
  return (
    // TODO: Use classes instead of `style` props for better performance
    <MovieCard movie={movie} key={movieId} profile={profile} content={
      <VoteResult pollId={pollId} movieId={movieId} />
    }>
      <CardActions style={{ flexFlow: 'row wrap', justifyContent: 'stretch' }}>
        {voteButtonSet}
        <div style={{ display: 'flex', flexFlow: 'row nowrap', flex: 1 }}>
          <div style={{ flex: 1 }}>{hasSeenSelection}</div>
          {profileId !== userId ? null : <Dropdown button={menuButton} align='right'>
            <MenuItem onClick={onDestroyClick}>
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
}

function UserHasSeenMovieSelection({ movieId, userId }: UserHasSeenMovieSelectionProps) {
  const [ratings] = useList(api.listUserRatings, {
    ordering: 'createdAt',
    direction: 'asc',
    profileId: userId,
  });
  const hasSeen = ratings && ratings.some((rating) => rating.movieId === movieId);
  return hasSeen == null ? null : <HasSeenMovieSelection movieId={movieId} hasSeen={hasSeen} />;
}

export default React.memo(MovieCandidate);
