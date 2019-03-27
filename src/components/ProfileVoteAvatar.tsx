import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import ProfileAvatar from './ProfileAvatar';
import VotePie from './VotePie';

interface ProfileVoteAvatarProps {
    pollId: string;
    user: {
        id: string;
        name?: string;
        picture?: string | null;
    };
}

function ProfileVoteAvatar({pollId, user}: ProfileVoteAvatarProps) {
    const [votes] = useList(api.listPollVotes, {
        pollId, ordering: 'createdAt', direction: 'asc',
    }, {
        profileId: user.id,
    });
    const [userRatings] = useList(api.listUserRatings, {
        profileId: user.id, ordering: 'createdAt', direction: 'asc',
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
    return <VotePie votes={votes} ratings={ratings} maxCount={movieCount} size={56}>
        <ProfileAvatar user={user} size={36} />
    </VotePie>;
}

export default ProfileVoteAvatar;
