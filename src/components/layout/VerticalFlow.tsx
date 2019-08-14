import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = (theme: Theme) => createStyles({
  verticalFlow: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
    '& > *:first-child': {
      marginTop: 0,
    },
  },
});

interface VerticalFlowProps extends React.HTMLAttributes<HTMLElement>, WithStyles<typeof styles> { }

const VerticalFlow = ({ classes, children, ...props }: VerticalFlowProps) => (
  <div {...props} className={classes.verticalFlow}>{children}</div>
);

export default withStyles(styles)(VerticalFlow);
