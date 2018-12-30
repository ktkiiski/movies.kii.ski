import {ObserverComponent} from 'broilerkit/react/observer';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { api } from '../client';
import { Rating, Vote } from '../resources';
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

interface ProfileVoteAvatarState {
    votes: Vote[];
    ratings: Rating[];
    movieCount: number;
}

class ProfileVoteAvatar extends ObserverComponent<ProfileVoteAvatarProps, ProfileVoteAvatarState> {

    public state$ = this.props$.pipe(
        switchMap(({pollId, user}) => combineLatest(
            // Observe votes of the user in this poll
            api.pollVoteCollection.observeAll({
                pollId, ordering: 'createdAt', direction: 'asc',
            }, {
                profileId: user.id,
            }),
            // Observe ratings of the user
            api.userRatingCollection.observeAll({profileId: user.id, ordering: 'createdAt', direction: 'asc'}),
            // Observe the poll candidates
            api.pollCandidateCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'}),
            (votes, userRatings, pollCandidates) => ({
                votes,
                ratings: userRatings.filter((rating) => (
                    pollCandidates.some((candidate) => candidate.movieId === rating.movieId)
                )),
                movieCount: pollCandidates.length,
            }),
        )),
    );

    public render() {
        const {user} = this.props;
        const {votes, ratings, movieCount} = this.state;
        if (!votes || !ratings || movieCount == null) {
            return null;
        }
        return <VotePie votes={votes} ratings={ratings} maxCount={movieCount} size={56}>
            <ProfileAvatar user={user} size={36} />
        </VotePie>;
    }
}

export default ProfileVoteAvatar;
