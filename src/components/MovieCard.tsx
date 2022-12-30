import ScheduleIcon from '@mui/icons-material/Schedule';
import { CardActionArea, Theme, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import type { Movie, PublicProfile } from '../resources';
import shortenSentences from '../utils/shortenSentences';
import MovieCardBackdrop from './MovieCardBackdrop';
import RatingBar from './RatingBar';
import HorizontalLayout from './layout/HorizontalLayout';

interface MovieCardProps {
  movie: Movie | null | undefined;
  profile?: PublicProfile | null;
  content?: React.ReactNode;
  children?: React.ReactNode;
}

function MovieCard({ movie, profile, children, content }: MovieCardProps) {
  const smallViewport = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
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
          {genres} {runtime && smallViewport && <br />}
          {runtime}
        </Typography>
        {rating == null ? null : <RatingBar rating={rating} />}
        {!smallViewport && (
          <Typography color="textSecondary" component="p">
            {shortenSentences(movie?.overview ?? '', 300)}
            {profile && (
              <>
                {' Suggested by  '}
                <strong>{profile.name}</strong>
              </>
            )}
          </Typography>
        )}
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
      {smallViewport && (
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
      )}
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
