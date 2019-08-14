import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = (theme: Theme) => createStyles({
  spacer: {
    padding: theme.spacing(2),
  },
});

interface SpacerProps extends WithStyles<typeof styles> {
  children?: React.ReactNode;
}

const Spacer = ({ classes, children }: SpacerProps) => (
  <div className={classes.spacer}>{children}</div>
);

export default withStyles(styles)(Spacer);
