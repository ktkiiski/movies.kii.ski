import { withStyles } from '@material-ui/core';
import * as React from 'react';

const stylize = withStyles({
    center: {
        display: 'flex',
        flexFlow: 'column nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
    },
});

const Center = stylize<React.HTMLAttributes<HTMLElement>>(({classes, children, className, ...props}) => (
    <div className={className ? `${classes.center} ${classes}` : classes.center} {...props}>{children}</div>
));

export default Center;
