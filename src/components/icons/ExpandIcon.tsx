import { withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as React from 'react';

const stylize = withStyles<'expand' | 'expandOpen' | 'expandClosed', {}>((theme) => ({
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
}));

const ExpandIcon = stylize<{up: boolean}>(({classes, up}) => (
    <ExpandMoreIcon className={`${classes.expand} ${up ? classes.expandOpen : classes.expandClosed}`} />
));

export default ExpandIcon;
