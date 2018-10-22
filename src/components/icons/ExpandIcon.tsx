import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as React from 'react';

const styles = (theme: Theme) => createStyles({
    expand: {
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    expandClosed: {
        transform: 'rotate(0deg)',
    },
});

interface ExpandIconProps extends WithStyles<typeof styles> {
    up: boolean;
}

const ExpandIcon = ({classes, up}: ExpandIconProps) => (
    <ExpandMoreIcon className={`${classes.expand} ${up ? classes.expandOpen : classes.expandClosed}`} />
);

export default withStyles(styles)(ExpandIcon);
