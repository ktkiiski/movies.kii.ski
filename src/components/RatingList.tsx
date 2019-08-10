import { createStyles, ListItemSecondaryAction, MenuItem, Select, Typography, WithStyles, withStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import StarIcon from '@material-ui/icons/Star';
import { useList } from 'broilerkit/react/api';
import { order } from 'broilerkit/utils/arrays';
import * as React from 'react';
import * as api from '../api';
import LoadingIndicator from './LoadingIndicator';

const styles = createStyles({
  secondaryAction: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

interface RatingListProps extends WithStyles<typeof styles> {
  userId: string;
}

type Ordering = 'value,desc' | 'value,asc' | 'createdAt,desc' | 'createdAt,asc';

function RatingList({ userId, classes }: RatingListProps) {
  const [ratings, , isLoading] = useList(api.listUserRatings, {
    ordering: 'createdAt',
    direction: 'asc',
    profileId: userId,
  });
  const [selectedOrdering, setOrdering] = React.useState('createdAt,desc');
  const onOrderingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrdering(event.target.value as Ordering);
  };
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!ratings) {
    return null;
  }
  const [ordering, direction] = selectedOrdering.split(',');
  const orderedRatings = order(ratings, ordering as 'createdAt' | 'value', direction as 'asc' | 'desc');
  return <>
    <Select displayEmpty value={selectedOrdering} onChange={onOrderingChange}>
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
        return <ListItem
          key={rating.movieId}
          component='a'
          button={!!linkUrl}
          href={linkUrl || undefined}
          target='_blank'
        >
          <ListItemText primary={primaryText} secondary={secondaryText} />
          <ListItemSecondaryAction className={classes.secondaryAction}>
            <StarIcon />
            <Typography>{value || '?'}</Typography>
          </ListItemSecondaryAction>
        </ListItem>;
      })}
    </List>
  </>;
}

export default withStyles(styles)(RatingList);
