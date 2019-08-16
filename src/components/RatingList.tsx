import { ListItemSecondaryAction, makeStyles, MenuItem, Select, Typography } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import StarIcon from '@material-ui/icons/Star';
import { useList } from 'broilerkit/react/api';
import { order } from 'broilerkit/utils/arrays';
import * as React from 'react';
import * as api from '../api';
import LoadingIndicator from './LoadingIndicator';

const useStyles = makeStyles({
  secondaryAction: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

interface RatingListProps {
  userId: string;
}

type Ordering = 'value,desc' | 'value,asc' | 'createdAt,desc' | 'createdAt,asc';

interface RatingListItemProps {
  linkUrl: string | null;
  children: React.ReactNode;
}

function RatingListItem({linkUrl, children}: RatingListItemProps) {
  if (linkUrl) {
    return <ListItem
      component='a'
      button
      href={linkUrl}
      target='_blank'
      rel='noopener'
    >{children}</ListItem>;
  }
  return <ListItem>{children}</ListItem>;
}

function RatingList({ userId }: RatingListProps) {
  const classes = useStyles();
  const [ratings, , isLoading] = useList(api.listUserRatings, {
    ordering: 'createdAt',
    direction: 'asc',
    profileId: userId,
  });
  const [selectedOrdering, setOrdering] = React.useState('createdAt,desc');
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!ratings) {
    return null;
  }
  const [ordering, direction] = selectedOrdering.split(',');
  const orderedRatings = order(ratings, ordering as 'createdAt' | 'value', direction as 'asc' | 'desc');
  return <>
    <Select
      displayEmpty
      value={selectedOrdering}
      onChange={(event) => setOrdering(event.target.value as Ordering)}
    >
      <MenuItem value={'createdAt,desc'}>Latest first</MenuItem>
      <MenuItem value={'createdAt,asc'}>Oldest first</MenuItem>
      <MenuItem value={'value,desc'}>Top rated first</MenuItem>
      <MenuItem value={'value,asc'}>Bottom rated first</MenuItem>
    </Select>
    <List dense>
      {orderedRatings.map((rating) => {
        const { movie, createdAt, value } = rating;
        let primaryText = movie && (movie.title || movie.originalTitle) || '(unknown)';
        let secondaryText = createdAt.toLocaleDateString();
        if (movie) {
          if (movie.releasedOn) {
            // Append a year in parentheses
            primaryText = `${primaryText} (${movie.releasedOn.getFullYear()})`;
          }
          if (movie.genres && movie.genres.length) {
            // Append the genre
            secondaryText = `${secondaryText}, ${movie.genres.join(', ')}`;
          }
          if (movie.originalTitle && movie.title && movie.title !== movie.originalTitle) {
            // Append the original name
            secondaryText = `${secondaryText}, ${movie.originalTitle}`;
          }
        }
        const linkUrl = movie && movie.imdbId && `https://www.imdb.com/title/${movie.imdbId}/`;
        return <RatingListItem key={rating.movieId} linkUrl={linkUrl}>
          <ListItemText primary={primaryText} secondary={secondaryText} />
          <ListItemSecondaryAction className={classes.secondaryAction}>
            <StarIcon />
            <Typography>{value || '?'}</Typography>
          </ListItemSecondaryAction>
        </RatingListItem>;
      })}
    </List>
  </>;
}

export default RatingList;
