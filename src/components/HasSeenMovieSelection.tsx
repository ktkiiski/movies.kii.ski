import { Checkbox, FormControlLabel, FormGroup, Hidden, makeStyles } from '@material-ui/core';

import { useOperation } from 'broilerkit/react/api';
import { useRequireAuth } from 'broilerkit/react/auth';
import * as React from 'react';
import * as api from '../api';

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
  const classes = useStyles();
  const requireAuth = useRequireAuth();
  const createPollRating = useOperation(api.createPollRating);
  const destroyPollCandidateRating = useOperation(api.destroyPollCandidateRating);
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const { id, name, picture } = await requireAuth();
    if (checked) {
      const now = new Date();
      await createPollRating.postOptimistically({
        pollId,
        movieId,
        profileId: id,
        profile: { id, name, picture },
        value: null,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await destroyPollCandidateRating.delete({
        pollId,
        movieId,
        profileId: id,
      });
    }
  };
  return (
    <FormGroup className={classes.root} {...props}>
      <FormControlLabel
        control={<Checkbox checked={hasSeen} onChange={onChange} />}
        label={
          <span className={classes.labelText}>
            {"I've seen this "}
            <Hidden xsDown>movie</Hidden>
          </span>
        }
      />
    </FormGroup>
  );
}

export default React.memo(HasSeenMovieSelection);
