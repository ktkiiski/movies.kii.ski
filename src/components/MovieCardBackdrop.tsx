import CardMedia from '@material-ui/core/CardMedia';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { darkTheme } from '../themes';

const ratio = `${(100 * 9 / 16).toFixed(2)}%`; // 16:9
const stylize = withStyles({
    backdrop: {
        height: 0,
        paddingTop: ratio,
        position: 'relative',
    },
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(to bottom, rgba(10,10,10,0.1), rgba(10,10,10,0.7))',
    },
    heading: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '3em 1em 1em 1em',
    },
});

interface MovieCardProps {
    backdropPath: string | null | undefined;
}

const MovieCardBackdrop = stylize<MovieCardProps>(({classes, backdropPath, children}) => {
    const backdropUrl = backdropPath && `https://image.tmdb.org/t/p/w1280${backdropPath}` || undefined;
    return (
        <MuiThemeProvider theme={darkTheme}>
            <CardMedia image={backdropUrl} className={classes.backdrop}>
            {!React.Children.count(children) ? null : <div className={classes.content}>
                <div className={classes.heading}>{children}</div>
            </div>}
            </CardMedia>
        </MuiThemeProvider>
    );
});

export default MovieCardBackdrop;
