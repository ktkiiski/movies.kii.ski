import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const stylize = withStyles({
    main: {
        flex: 1,
    },
});

interface HorizontalLayoutProps {
    left?: React.ReactNode;
    right?: React.ReactNode;
    align?: 'top' | 'center' | 'bottom';
}

const HorizontalLayout = stylize<HorizontalLayoutProps>(({classes, children, left, right, align, ...props}) => (
    <div>
        <Grid
            container
            direction='row'
            spacing={8}
            alignItems={align === 'center' ? 'center' : align === 'bottom' ? 'flex-end' : 'flex-start'}
            {...props}
        >
            {left && <Grid item>{left}</Grid>}
            {React.Children.count(children) ? <Grid item className={classes.main}>{children}</Grid> : null}
            {right && <Grid item>{right}</Grid>}
        </Grid>
    </div>
));

export default HorizontalLayout;
