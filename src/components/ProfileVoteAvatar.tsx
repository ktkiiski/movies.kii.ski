import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import type { PollParticipant } from '../resources';
import ProfileAvatar from './ProfileAvatar';
import VoteCountPie from './VoteCountPie';

interface ProfileVoteAvatarProps {
  pollId: string;
  participant: PollParticipant;
}

function ProfileVoteAvatar({ pollId, participant }: ProfileVoteAvatarProps) {
  const { profile, profileId, positiveVoteCount, neutralVoteCount, negativeVoteCount } = participant;
  const [votes] = useList(
    api.listPollVotes,
    {
      pollId,
      ordering: 'createdAt',
      direction: 'asc',
    },
    {
      profileId,
    },
  );
  const [userRatings] = useList(
    api.listPollRatings,
    {
      pollId,
      ordering: 'createdAt',
      direction: 'asc',
    },
    {
      profileId,
    },
  );
  const [pollCandidates] = useList(api.listPollCandidates, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  if (!votes || !userRatings || !pollCandidates) {
    return null;
  }
  const ratings = userRatings.filter((rating) =>
    pollCandidates.some((candidate) => candidate.movieId === rating.movieId),
  );
  const movieCount = pollCandidates.length;
  return (
    <VoteCountPie
      positiveVoteCount={positiveVoteCount}
      neutralVoteCount={neutralVoteCount}
      negativeVoteCount={negativeVoteCount}
      ratings={ratings}
      maxCount={movieCount}
      size={56}
      animate={false}
    >
      {profile && <ProfileAvatar user={profile} size={36} />}
    </VoteCountPie>
  );
}

export default ProfileVoteAvatar;
