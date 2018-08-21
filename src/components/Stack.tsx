import { withStyles } from '@material-ui/core';
import * as React from 'react';

const stylize = withStyles({
    stack: {
        'position': 'relative',
        '& > *': {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
    },
});

const Stack = stylize<React.HTMLAttributes<HTMLElement>>(({classes, children, className, ...props}) => (
    <div className={className ? `${classes.stack} ${classes}` : classes.stack} {...props}>{children}</div>
));

export default Stack;
