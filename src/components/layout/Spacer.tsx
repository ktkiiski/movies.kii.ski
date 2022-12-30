import makeStyles from '@mui/styles/makeStyles';
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
