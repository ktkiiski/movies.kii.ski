import { makeStyles } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  loader: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}));

export default function LoadingIndicator() {
  const classes = useStyles();
  return (
    <div className={classes.loader}>
      <CircularProgress />
    </div>
  );
}
