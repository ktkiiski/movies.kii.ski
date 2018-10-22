import Grid from '@material-ui/core/Grid';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';

const styles = createStyles({
    main: {
        flex: 1,
    },
});

interface HorizontalLayoutProps extends WithStyles<typeof styles> {
    left?: React.ReactNode;
    right?: React.ReactNode;
    align?: 'top' | 'center' | 'bottom';
    children?: React.ReactNode;
}

const HorizontalLayout = ({classes, children, left, right, align, ...props}: HorizontalLayoutProps) => (
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
);

export default withStyles(styles)(HorizontalLayout);
