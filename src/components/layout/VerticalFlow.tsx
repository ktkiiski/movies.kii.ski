import { makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  verticalFlow: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
    '& > *:first-child': {
      marginTop: 0,
    },
  },
}));

function VerticalFlow({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  const classes = useStyles();
  return <div {...props} className={classes.verticalFlow}>{children}</div>;
}

export default VerticalFlow;
