import SelectedNegativeIcon from '@mui/icons-material/ThumbDown';
import SelectedPositiveIcon from '@mui/icons-material/ThumbUp';
import SelectedNeutralIcon from '@mui/icons-material/ThumbsUpDown';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';
import useCreatePollParticipant from '../hooks/useCreatePollParticipant';
import useCreatePollVote from '../hooks/useCreatePollVote';
import useDeletePollVote from '../hooks/useDeletePollVote';
import type { Vote } from '../resources';
import { useRequireAuth } from './SignInDialogProvider';
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

function VoteButton({ children, value, buttonValue, onSelect }: VoteButtonProps) {
  // eslint-disable-next-line no-nested-ternary
  const color = buttonValue === 1 ? 'primary' : buttonValue === -1 ? 'secondary' : 'inherit';
  return (
    <IconButton onClick={() => onSelect(buttonValue, value)} color={color} size="large">
      {children}
    </IconButton>
  );
}

interface VoteButtonSetProps {
  movieId: number;
  pollId: string;
  currentValue: VoteValue | null;
}

function VoteButtonSet({ movieId, pollId, currentValue }: VoteButtonSetProps) {
  const requireAuth = useRequireAuth();
  const createPollParticipant = useCreatePollParticipant();
  const createOrUpdatePollVote = useCreatePollVote();
  const deletePollVote = useDeletePollVote();

  const onSelect = async (value: VoteValue, oldValue?: VoteValue | null) => {
    const auth = await requireAuth();
    const profileId = auth.uid;
    if (value !== oldValue) {
      // Ensure that the user is the participant in this poll
      createPollParticipant({ pollId, profileId });
    }
    if (oldValue == null || value !== oldValue) {
      // Create or update a new vote
      await createOrUpdatePollVote({
        movieId,
        pollId,
        value,
        profileId,
      });
    } else {
      // Remove old value
      await deletePollVote({ movieId, pollId, profileId });
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
