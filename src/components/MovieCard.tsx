import { CardActionArea } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import ScheduleIcon from '@material-ui/icons/Schedule';
import { shortenSentences } from 'broilerkit/strings';
import * as React from 'react';
import type { Movie, PublicProfile } from '../resources';
import MovieCardBackdrop from './MovieCardBackdrop';
import RatingBar from './RatingBar';
import HorizontalLayout from './layout/HorizontalLayout';

interface MovieCardProps {
  movie: Movie | null;
  profile?: PublicProfile | null;
  content?: React.ReactNode;
  children?: React.ReactNode;
}

function MovieCard({ movie, profile, children, content }: MovieCardProps) {
  const year = movie && movie.releasedOn && movie.releasedOn.getFullYear();
  const genres = movie && [''].concat(movie.genres).join(', ');
  const runtime = movie && getRuntime(movie.runtime);
  const rating = movie && movie.voteAverage;
  const linkUrl = movie && movie.imdbId && `https://www.imdb.com/title/${movie.imdbId}/`;
  const backdropPath = movie && movie.backdropPath;
  const backdrop = (
    <MovieCardBackdrop backdropPath={backdropPath}>
      <HorizontalLayout right={content} align="bottom">
        <Typography color="textPrimary" variant="h5">
          {movie && movie.title}
        </Typography>
        {movie && movie.originalTitle !== movie.title ? (
          <Typography color="textPrimary" variant="subtitle1">
            <em>{movie.originalTitle}</em>
          </Typography>
        ) : null}
        <Typography color="textPrimary" variant="subtitle1">
          {year}
          {genres}{' '}
          {runtime && (
            <Hidden smUp>
              <br />
            </Hidden>
          )}
          {runtime}
        </Typography>
        {rating == null ? null : <RatingBar rating={rating} />}
        <Hidden xsDown implementation="css">
          <Typography color="textSecondary" component="p">
            {movie && shortenSentences(movie.overview, 300)}
            {profile && (
              <>
                {' Suggested by  '}
                <strong>{profile.name}</strong>
              </>
            )}
          </Typography>
        </Hidden>
      </HorizontalLayout>
    </MovieCardBackdrop>
  );
  return (
    <Card>
      {linkUrl ? (
        <CardActionArea href={linkUrl} target="_blank">
          {backdrop}
        </CardActionArea>
      ) : (
        backdrop
      )}
      <Hidden smUp implementation="css">
        <CardContent>
          <Typography component="p" color="textSecondary">
            {movie && movie.overview}
            {profile && (
              <>
                {' Suggested by '}
                <strong>{profile.name}</strong>
              </>
            )}
          </Typography>
        </CardContent>
      </Hidden>
      {children}
    </Card>
  );
}

function getRuntime(minutes: number | null): React.ReactNode {
  if (minutes === null) {
    return '';
  }
  const hours = Math.floor(minutes / 60);
  // eslint-disable-next-line no-param-reassign
  minutes = Math.floor(minutes % 60);
  return (
    <>
      <ScheduleIcon fontSize="inherit" />
      {hours ? ` ${hours}h ${minutes}min` : ` ${minutes}min`}
    </>
  );
}

export default MovieCard;
