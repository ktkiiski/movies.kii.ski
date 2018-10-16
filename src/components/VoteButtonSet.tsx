import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import SelectedNegativeIcon from '@material-ui/icons/ThumbDown';
import SelectedNeutralIcon from '@material-ui/icons/ThumbsUpDown';
import SelectedPositiveIcon from '@material-ui/icons/ThumbUp';
import { AuthUser } from 'broilerkit/auth';
import { identifier } from 'broilerkit/id';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { api, authClient } from '../client';
import { Vote } from '../resources';
import NegativeIcon from './icons/ThumbDownOutline';
import NeutralIcon from './icons/ThumbsUpDownOutline';
import PositiveIcon from './icons/ThumbUpOutline';
// import { fade } from '@material-ui/core/styles/colorManipulator';

type VoteValue = Vote['value'];

interface VoteButtonProps {
    value?: VoteValue | null;
    onSelect: (newValue: VoteValue, oldValue?: VoteValue | null) => void;
    buttonValue: VoteValue;
    children: React.ReactNode;
}

const VoteButton = withStyles<'positive' | 'negative' | 'neutral', {}>(() => ({
    positive: {
        // background: fade(theme.palette.primary.dark, 0.1),
    },
    negative: {
        // background: fade(theme.palette.secondary.dark, 0.1),
    },
    neutral: {
        // background: fade(theme.palette.action.active, 0.1),
    },
}))<VoteButtonProps>(({children, value, buttonValue, onSelect, classes}) => {
    const color = buttonValue === 1 ? 'primary' : buttonValue === -1 ? 'secondary' : 'inherit';
    const rootClass = value === 1 ? 'positive' : value === -1 ? 'negative' : 'neutral';
    return <IconButton
        classes={value === buttonValue ? {root: classes[rootClass]} : undefined}
        onClick={() => onSelect(buttonValue, value)}
        color={color}>
        {children}
    </IconButton>;
});

interface VoteButtonSetProps {
    movieId: number;
    pollId: string;
}

interface VoteButtonSetState {
    currentVoteValue: Vote['value'] | null;
    user: AuthUser | null;
}

class VoteButtonSet extends ObserverComponent<VoteButtonSetProps, VoteButtonSetState> {

    public votes$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollVoteCollection.observeAll({
            pollId, ordering: 'createdAt', direction: 'asc',
        })),
    );
    public currentVote$ = combineLatest(
        this.votes$, authClient.userId$, this.pluckProp('movieId'),
        (votes, userId, movieId) => votes.find((vote) => vote.movieId === movieId && vote.profileId === userId),
    );
    public currentVoteValue$ = this.currentVote$.pipe(
        map((vote) => vote ? vote.value : null),
        distinctUntilChanged(),
    );
    public state$ = combineLatest(this.currentVoteValue$, authClient.user$, (currentVoteValue, user) => ({
        currentVoteValue, user,
    }));

    public onSelect = (value: VoteValue, oldValue?: VoteValue | null) => {
        const {movieId, pollId} = this.props;
        const {user} = this.state;
        if (!user) {
            return;
        }
        if (oldValue == null) {
            // Create a new vote
            const now = new Date();
            api.pollVoteCollection.postOptimistically({
                movieId, pollId, value,
                profileId: user.id,
                profile: user,
                version: identifier(),
                createdAt: now,
                updatedAt: now,
            });
        } else if (value === oldValue) {
            // Remove old value
            api.pollVoteResource.deleteWithUser({movieId, pollId});
        } else {
            // Update existing value
            api.pollVoteResource.patchWithUser({movieId, pollId, value});
        }
    }

    public render() {
        const value = this.state.currentVoteValue;
        return <div>
            <Grid container spacing={0} item direction='row'>
                <Grid item>
                    <VoteButton value={value} buttonValue={1} onSelect={this.onSelect}>
                        {value === 1 ? <SelectedPositiveIcon /> : <PositiveIcon />}
                    </VoteButton>
                </Grid>
                <Grid item>
                    <VoteButton value={value} buttonValue={0} onSelect={this.onSelect}>
                        {value === 0 ? <SelectedNeutralIcon /> : <NeutralIcon />}
                    </VoteButton>
                </Grid>
                <Grid item>
                    <VoteButton value={value} buttonValue={-1} onSelect={this.onSelect}>
                        {value === -1 ? <SelectedNegativeIcon /> : <NegativeIcon />}
                    </VoteButton>
                </Grid>
            </Grid>
        </div>;
    }
}

export default VoteButtonSet;
