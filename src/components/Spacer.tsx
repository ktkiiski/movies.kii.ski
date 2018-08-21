import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const stylize = withStyles<'spacer', {}>((theme) => ({
    spacer: {
        padding: theme.spacing.unit * 2,
    },
}));

const Spacer = stylize(({classes, children = 1}) => (
    <div className={classes.spacer}>{children}</div>
));

export default Spacer;
