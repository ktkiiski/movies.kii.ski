import { makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  spacer: {
    padding: theme.spacing(2),
  },
}));

interface SpacerProps {
  children?: React.ReactNode;
}

export default function Spacer({ children }: SpacerProps) {
  const classes = useStyles();
  return <div className={classes.spacer}>{children}</div>;
}
