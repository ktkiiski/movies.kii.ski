import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import SelectedNegativeIcon from '@material-ui/icons/ThumbDown';
import SelectedPositiveIcon from '@material-ui/icons/ThumbUp';
import SelectedNeutralIcon from '@material-ui/icons/ThumbsUpDown';
import { useOperation } from 'broilerkit/react/api';
import { useRequireAuth } from 'broilerkit/react/auth';
import * as React from 'react';
import * as api from '../api';
import type { Vote } from '../resources';
import NegativeIcon from './icons/ThumbDownOutline';
import PositiveIcon from './icons/ThumbUpOutline';
import NeutralIcon from './icons/ThumbsUpDownOutline';

type VoteValue = Vote['value'];

interface VoteButtonProps {
  value?: VoteValue | null;
  onSelect: (newValue: VoteValue, oldValue?: VoteValue | null) => void;
  buttonValue: VoteValue;
  children: React.ReactNode;
}

const VoteButton = ({ children, value, buttonValue, onSelect }: VoteButtonProps) => {
  // eslint-disable-next-line no-nested-ternary
  const color = buttonValue === 1 ? 'primary' : buttonValue === -1 ? 'secondary' : 'inherit';
  return (
    <IconButton onClick={() => onSelect(buttonValue, value)} color={color}>
      {children}
    </IconButton>
  );
};

interface VoteButtonSetProps {
  movieId: number;
  pollId: string;
  currentValue: VoteValue | null;
}

function VoteButtonSet({ movieId, pollId, currentValue }: VoteButtonSetProps) {
  const requireAuth = useRequireAuth();
  const createPollParticipantOperation = useOperation(api.createPollParticipant);
  const createPollVoteOperation = useOperation(api.createPollVote);
  const destroyPollVoteOperation = useOperation(api.destroyPollVote);
  const updatePollVote = useOperation(api.updatePollVote);

  const onSelect = async (value: VoteValue, oldValue?: VoteValue | null) => {
    const auth = await requireAuth();
    if (value !== oldValue) {
      // Ensure that the user is the participant in this poll
      createPollParticipantOperation.post({ pollId });
    }
    if (oldValue == null) {
      // Create a new vote
      const now = new Date();
      await createPollVoteOperation.postOptimistically({
        movieId,
        pollId,
        value,
        profileId: auth.id,
        profile: auth,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }
    if (value === oldValue) {
      // Remove old value
      destroyPollVoteOperation.delete({ movieId, pollId, profileId: auth.id });
    } else {
      // Update existing value
      updatePollVote.patch({ movieId, pollId, value, profileId: auth.id });
    }
  };
  return (
    <div>
      <Grid container spacing={0} item direction="row">
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
    </div>
  );
}

export default React.memo(VoteButtonSet);
