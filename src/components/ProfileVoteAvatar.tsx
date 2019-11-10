import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import ProfileAvatar from './ProfileAvatar';
import VoteCountPie from './VoteCountPie';

interface ProfileVoteAvatarProps {
  pollId: string;
  user: {
    id: string;
    name?: string | null;
    picture?: string | null;
  };
  participant: {
    positiveVoteCount: number;
    neutralVoteCount: number;
    negativeVoteCount: number;
  };
}

function ProfileVoteAvatar({ pollId, user, participant }: ProfileVoteAvatarProps) {
  const [votes] = useList(api.listPollVotes, {
    pollId, ordering: 'createdAt', direction: 'asc',
  }, {
    profileId: user.id,
  });
  const [userRatings] = useList(api.listPollRatings, {
    pollId, ordering: 'createdAt', direction: 'asc',
  }, {
    profileId: user.id,
  });
  const [pollCandidates] = useList(api.listPollCandidates, {
    pollId, ordering: 'createdAt', direction: 'asc',
  });
  if (!votes || !userRatings || !pollCandidates) {
    return null;
  }
  const ratings = userRatings.filter((rating) => (
    pollCandidates.some((candidate) => candidate.movieId === rating.movieId)
  ));
  const movieCount = pollCandidates.length;
  return <VoteCountPie
    ratings={ratings}
    maxCount={movieCount}
    size={56}
    positiveVoteCount={participant.positiveVoteCount}
    neutralVoteCount={participant.neutralVoteCount}
    negativeVoteCount={participant.negativeVoteCount}
  >
    <ProfileAvatar user={user} size={36} />
  </VoteCountPie>;
}

export default ProfileVoteAvatar;
