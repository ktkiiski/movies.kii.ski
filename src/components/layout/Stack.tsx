import { createStyles, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';

const styles = createStyles({
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

interface StackProps extends React.HTMLAttributes<HTMLElement>, WithStyles<typeof styles> { }

const Stack = ({ classes, children, className, ...props }: StackProps) => (
  <div className={className ? `${classes.stack} ${classes}` : classes.stack} {...props}>{children}</div>
);

export default withStyles(styles)(Stack);
