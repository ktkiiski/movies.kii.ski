import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const stylize = withStyles<'loader', {}>((theme) => ({
    loader: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
    },
}));

export default stylize(({classes}) => (
    <div className={classes.loader}><CircularProgress /></div>
));
