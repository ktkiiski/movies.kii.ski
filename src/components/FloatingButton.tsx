import Button, { ButtonProps } from '@material-ui/core/Button';

import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';

const stylize = withStyles(({spacing}) => ({
    fab: {
        position: 'absolute' as 'absolute',
        bottom: spacing.unit * 2,
        right: spacing.unit * 2,
    },
}));

const FloatingButton = stylize<ButtonProps>(({classes, ...props}) => (
    <Button className={classes.fab} variant='fab' color='primary' {...props}>
        <AddIcon />
    </Button>
));

export default FloatingButton;
