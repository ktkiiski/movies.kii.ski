import { createStyles, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';

const styles = createStyles({
  center: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});

interface CenterProps extends React.HTMLAttributes<HTMLElement>, WithStyles<typeof styles> { }

const Center = ({ classes, children, className, ...props }: CenterProps) => (
  <div className={className ? `${classes.center} ${classes}` : classes.center} {...props}>{children}</div>
);

export default withStyles(styles)(Center);
