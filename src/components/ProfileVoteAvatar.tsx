import usePollCandidates from '../hooks/usePollCandidates';
import usePollVotes from '../hooks/usePollVotes';
import useUserRatings from '../hooks/useUserRatings';
import { Participant } from '../resources';
import ProfileAvatar from './ProfileAvatar';
import VoteCountPie from './VoteCountPie';

interface ProfileVoteAvatarProps {
  pollId: string;
  participant: Participant;
}

function ProfileVoteAvatar({ pollId, participant }: ProfileVoteAvatarProps) {
  const { profileId } = participant;
  const [allVotes, isLoadingVotes] = usePollVotes(pollId);
  const profileVotes = allVotes.filter((vote) => vote.profileId === profileId);
  const [userRatings, isLoadingRatings] = useUserRatings(profileId);
  const [pollCandidates, isLoadingCandidates] = usePollCandidates(pollId);
  if (isLoadingVotes || isLoadingRatings || isLoadingCandidates) {
    return null;
  }
  const ratings = userRatings.filter((rating) =>
    pollCandidates.some((candidate) => candidate.movieId === rating.movieId),
  );
  const movieCount = pollCandidates.length;
  const positiveVoteCount = profileVotes.filter((vote) => vote.value === 1).length;
  const neutralVoteCount = profileVotes.filter((vote) => vote.value === 0).length;
  const negativeVoteCount = profileVotes.filter((vote) => vote.value === -1).length;
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
      <ProfileAvatar profileId={profileId} size={36} />
    </VoteCountPie>
  );
}

export default ProfileVoteAvatar;
