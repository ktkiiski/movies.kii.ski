import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import SelectedNegativeIcon from '@material-ui/icons/ThumbDown';
import SelectedNeutralIcon from '@material-ui/icons/ThumbsUpDown';
import SelectedPositiveIcon from '@material-ui/icons/ThumbUp';
import { identifier } from 'broilerkit/id';
import { useOperation } from 'broilerkit/react/api';
import { useRequireAuth } from 'broilerkit/react/auth';
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

const VoteButton = ({ children, value, buttonValue, onSelect }: VoteButtonProps) => {
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
  currentValue: VoteValue | null;
}

function VoteButtonSet({ movieId, pollId, currentValue }: VoteButtonSetProps) {
  const requireAuth = useRequireAuth();
  const createPollVoteOperation = useOperation(api.createPollVote);
  const destroyPollVoteOperation = useOperation(api.destroyPollVote);
  const updatePollVote = useOperation(api.updatePollVote);

  const onSelect = async (value: VoteValue, oldValue?: VoteValue | null) => {
    const auth = await requireAuth();
    if (oldValue == null) {
      // Create a new vote
      const now = new Date();
      return await createPollVoteOperation.postOptimistically({
        movieId, pollId, value,
        profileId: auth.id,
        profile: auth,
        version: identifier(),
        createdAt: now,
        updatedAt: now,
      });
    } else if (value === oldValue) {
      // Remove old value
      destroyPollVoteOperation.delete({ movieId, pollId, profileId: auth.id });
    } else {
      // Update existing value
      updatePollVote.patch({ movieId, pollId, value, profileId: auth.id });
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
