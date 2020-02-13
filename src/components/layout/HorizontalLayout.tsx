import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';

const useStyles = makeStyles({
  main: {
    flex: 1,
  },
});

interface HorizontalLayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  align?: 'top' | 'center' | 'bottom';
  children?: React.ReactNode;
}

function HorizontalLayout({ children, left, right, align, ...props }: HorizontalLayoutProps) {
  const classes = useStyles();
  return <div>
    <Grid
      container
      direction='row'
      spacing={2}
      alignItems={align === 'center' ? 'center' : align === 'bottom' ? 'flex-end' : 'flex-start'}
      {...props}
    >
      {left && <Grid item>{left}</Grid>}
      {React.Children.count(children) ? <Grid item className={classes.main}>{children}</Grid> : null}
      {right && <Grid item>{right}</Grid>}
    </Grid>
  </div>;
}

export default HorizontalLayout;
