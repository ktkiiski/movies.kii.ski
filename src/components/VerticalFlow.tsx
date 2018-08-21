import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const stylize = withStyles<'verticalFlow', {}>((theme) => ({
    verticalFlow: {
        '& > *': {
            marginTop: theme.spacing.unit * 2,
        },
        '& > *:first-child': {
            marginTop: 0,
        },
    },
}));

const VerticalFlow = stylize(({classes, children}) => (
    <div className={classes.verticalFlow}>{children}</div>
));

export default VerticalFlow;
