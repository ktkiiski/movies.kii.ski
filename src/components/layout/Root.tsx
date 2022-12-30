import makeStyles from '@mui/styles/makeStyles';
import * as React from 'react';

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    padding: spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 1024,
  },
}));

interface RootProps {
  children?: React.ReactNode;
}

export default function Root({ children }: RootProps) {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>;
}
