import { Collapse, Divider, IconButton, MenuItem } from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import MenuIcon from '@material-ui/icons/MoreVert';
import * as React from 'react';
import { useState } from 'react';
import useDeletePollCandidate from '../hooks/useDeletePollCandidate';
import useMovie from '../hooks/useMovie';
import usePollVotes from '../hooks/usePollVotes';
import usePublicProfile from '../hooks/usePublicProfile';
import useUserId from '../hooks/useUserId';
import useUserRatings from '../hooks/useUserRatings';
import type { Candidate } from '../resources';
import Dropdown from './Dropdown';
import HasSeenMovieSelection from './HasSeenMovieSelection';
import MovieCard from './MovieCard';
import { useRequireAuth } from './SignInDialogProvider';
import VoteButtonSet from './VoteButtonSet';
import VoteResult from './VoteResult';
import VoteTable from './VoteTable';
import ExpandIcon from './icons/ExpandIcon';

interface MovieCandidateProps {
  pollId: string;
  candidate: Candidate;
}

const menuButton = (
  <IconButton>
    <MenuIcon />
  </IconButton>
);

function MovieCandidate({ pollId, candidate }: MovieCandidateProps) {
  const { movieId, profileId } = candidate;
  const [movie] = useMovie(movieId);
  const [profile] = usePublicProfile(profileId);
  const [isExpanded, setIsExpanded] = useState(false);
  const userId = useUserId();
  const requireAuth = useRequireAuth();
  const deletePollCandidate = useDeletePollCandidate();
  const onDestroyClick = async () => {
    const auth = await requireAuth();
    await deletePollCandidate({ pollId, movieId, profileId: auth.uid });
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
  const [allVotes] = usePollVotes(pollId);
  const votes = allVotes.filter((vote) => vote.movieId === movieId && vote.profileId === userId);
  const currentValue = votes && votes.length ? votes[0].value : null;
  return <VoteButtonSet movieId={movieId} pollId={pollId} currentValue={currentValue} />;
}

interface UserHasSeenMovieSelectionProps {
  movieId: number;
  userId: string;
  pollId: string;
}

function UserHasSeenMovieSelection({ movieId, userId, pollId }: UserHasSeenMovieSelectionProps) {
  const [userRatings, loading] = useUserRatings(userId);
  const hasSeen = userRatings.some((rating) => rating.movieId === movieId);
  if (loading) {
    return null;
  }
  return <HasSeenMovieSelection movieId={movieId} hasSeen={hasSeen} pollId={pollId} />;
}

export default React.memo(MovieCandidate);
