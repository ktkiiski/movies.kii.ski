import CardMedia from '@material-ui/core/CardMedia';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import * as React from 'react';
import { darkTheme } from '../themes';

const ratio = `${(100 * 9 / 16).toFixed(2)}%`; // 16:9
const styles = (theme: Theme) => createStyles({
  backdrop: {
    height: 0,
    minHeight: 256,
    paddingTop: ratio,
    position: 'relative',
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'linear-gradient(to bottom, rgba(20,20,20,0.3), rgba(20,20,20,0.8))',
  },
  heading: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '3em 1em 1em 1em',
  },
  linkButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  },
});

interface MovieCardProps extends WithStyles<typeof styles> {
  backdropPath: string | null | undefined;
  children?: React.ReactNode;
}

const MovieCardBackdrop = withStyles(styles)(({ classes, backdropPath, children }: MovieCardProps) => {
  const backdropUrl = backdropPath && `https://image.tmdb.org/t/p/w1280${backdropPath}` || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOMi439DwAEUgIZT0JltgAAAABJRU5ErkJggg==';
  return (
    <ThemeProvider theme={darkTheme}>
      <CardMedia image={backdropUrl} className={classes.backdrop}>
        {!React.Children.count(children) ? null : <div className={classes.content}>
          <div className={classes.heading}>{children}</div>
        </div>}
      </CardMedia>
    </ThemeProvider>
  );
});

export default MovieCardBackdrop;
