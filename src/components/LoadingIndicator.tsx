import CircularProgress from '@material-ui/core/CircularProgress';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = (theme: Theme) => createStyles({
  loader: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
  },
});

export default withStyles(styles)(({ classes }: WithStyles<typeof styles>) => (
  <div className={classes.loader}><CircularProgress /></div>
));
