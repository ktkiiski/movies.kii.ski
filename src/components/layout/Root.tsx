import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = ({ spacing }: Theme) => createStyles({
  root: {
    padding: spacing.unit * 2,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 1024,
  },
});

interface RootProps extends WithStyles<typeof styles> {
  children?: React.ReactNode;
}

export default withStyles(styles)(({ classes, children }: RootProps) => (
  <div className={classes.root}>{children}</div>
));
