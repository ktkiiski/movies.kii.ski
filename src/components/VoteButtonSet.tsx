import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import SelectedNegativeIcon from '@material-ui/icons/ThumbDown';
import SelectedNeutralIcon from '@material-ui/icons/ThumbsUpDown';
import SelectedPositiveIcon from '@material-ui/icons/ThumbUp';
import { AuthUser } from 'broilerkit/auth';
import { identifier } from 'broilerkit/id';
import { useList, useOperation } from 'broilerkit/react/api';
import { useAuth } from 'broilerkit/react/auth';
import * as React from 'react';
import * as api from '../api';
import { Vote } from '../resources';
import NegativeIcon from './icons/ThumbDownOutline';
import NeutralIcon from './icons/ThumbsUpDownOutline';
import PositiveIcon from './icons/ThumbUpOutline';

type VoteValue = Vote['value'];

interface VoteButtonProps {
    value?: VoteValue | null;
    onSelect: (newValue: VoteValue, oldValue?: VoteValue | null) => void;
    buttonValue: VoteValue;
    children: React.ReactNode;
}

const VoteButton = ({children, value, buttonValue, onSelect}: VoteButtonProps) => {
    const color = buttonValue === 1 ? 'primary' : buttonValue === -1 ? 'secondary' : 'inherit';
    return <IconButton
        onClick={() => onSelect(buttonValue, value)}
        color={color}>
        {children}
    </IconButton>;
};

interface VoteButtonSetProps {
    movieId: number;
    pollId: string;
}

function VoteButtonSet({movieId, pollId}: VoteButtonSetProps) {
    const user = useAuth();
    const userId = user && user.id;
    const pollVotes = useList(api.listPollVotes, {
        pollId, ordering: 'createdAt', direction: 'asc',
    });
    const createPollParticipant = useOperation(api.createPollParticipant, (op) => (
        op.post({pollId})
    ));
    // tslint:disable-next-line:no-shadowed-variable
    const createPollVote = useOperation(api.createPollVote, async (op, user: AuthUser, value: VoteValue) => {
        // Create a new vote
        const now = new Date();
        return await op.postOptimistically({
            movieId, pollId, value,
            profileId: user.id,
            profile: user,
            version: identifier(),
            createdAt: now,
            updatedAt: now,
        });
    });
    const destroyPollVote = useOperation(api.destroyPollVote, (op) => (
        op.deleteWithUser({movieId, pollId})
    ));
    const updatePollVote = useOperation(api.updatePollVote, (op, value: VoteValue) => (
        op.patchWithUser({movieId, pollId, value})
    ));
    const votes = pollVotes && pollVotes.filter((vote) => (
        vote.movieId === movieId && vote.profileId === userId
    ));
    const currentValue = votes && votes.length ? votes[0].value : null;

    const onSelect = (value: VoteValue, oldValue?: VoteValue | null) => {
        if (!user) {
            return;
        }
        if (value !== oldValue) {
            // Ensure that the user is the participant in this poll
            createPollParticipant();
        }
        if (oldValue == null) {
            // Create a new vote
            createPollVote(user, value);
        } else if (value === oldValue) {
            // Remove old value
            destroyPollVote();
        } else {
            // Update existing value
            updatePollVote(value);
        }
    };
    return <div>
        <Grid container spacing={0} item direction='row'>
            <Grid item>
                <VoteButton value={currentValue} buttonValue={1} onSelect={onSelect}>
                    {currentValue === 1 ? <SelectedPositiveIcon /> : <PositiveIcon />}
                </VoteButton>
            </Grid>
            <Grid item>
                <VoteButton value={currentValue} buttonValue={0} onSelect={onSelect}>
                    {currentValue === 0 ? <SelectedNeutralIcon /> : <NeutralIcon />}
                </VoteButton>
            </Grid>
            <Grid item>
                <VoteButton value={currentValue} buttonValue={-1} onSelect={onSelect}>
                    {currentValue === -1 ? <SelectedNegativeIcon /> : <NegativeIcon />}
                </VoteButton>
            </Grid>
        </Grid>
    </div>;
}

export default React.memo(VoteButtonSet);
