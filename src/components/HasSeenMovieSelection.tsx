import { Checkbox, FormControlLabel, FormGroup, makeStyles, Theme, useMediaQuery } from '@material-ui/core';
import { memo } from 'react';
import useCreateRating from '../hooks/useCreateRating';
import useDeleteRating from '../hooks/useDeleteRating';
import { useRequireAuth } from './SignInDialogProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
  },
  labelText: {
    whiteSpace: 'nowrap',
  },
}));

interface HasSeenMovieSelectionProps {
  style?: React.CSSProperties;
  pollId: string;
  movieId: number;
  hasSeen: boolean;
}

function HasSeenMovieSelection({ movieId, pollId, hasSeen, ...props }: HasSeenMovieSelectionProps) {
  const longerLabel = useMediaQuery<Theme>((theme) => theme.breakpoints.up('sm'));
  const classes = useStyles();
  const requireAuth = useRequireAuth();
  const createRating = useCreateRating();
  const deleteRating = useDeleteRating();
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const { uid } = await requireAuth();
    if (checked) {
      await createRating({
        movieId,
        profileId: uid,
        value: null,
      });
    } else {
      await deleteRating({
        movieId,
        profileId: uid,
      });
    }
  };
  return (
    <FormGroup className={classes.root} {...props}>
      <FormControlLabel
        control={<Checkbox checked={hasSeen} onChange={onChange} />}
        label={<span className={classes.labelText}>{longerLabel ? "I've seen this movie" : "I've seen this"}</span>}
      />
    </FormGroup>
  );
}

export default memo(HasSeenMovieSelection);
