import { makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles({
  center: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});

function Center({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const classes = useStyles();
  return <div className={className ? `${classes.center} ${classes}` : classes.center} {...props}>{children}</div>;
}

export default Center;
