import makeStyles from '@mui/styles/makeStyles';
import * as React from 'react';

const useStyles = makeStyles({
  stack: {
    'position': 'relative',
    '& > *': {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
});

function Stack({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const classes = useStyles();
  return (
    <div className={className ? `${classes.stack} ${classes}` : classes.stack} {...props}>
      {children}
    </div>
  );
}

export default Stack;
