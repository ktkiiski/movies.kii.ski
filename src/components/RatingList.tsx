import StarIcon from '@mui/icons-material/Star';
import { ListItemSecondaryAction, MenuItem, Select, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import makeStyles from '@mui/styles/makeStyles';
import order from 'immuton/order';
import * as React from 'react';
import useMovie from '../hooks/useMovie';
import useUserRatings from '../hooks/useUserRatings';
import { Rating } from '../resources';
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
  rating: Rating;
}

function RatingListItem({ rating }: RatingListItemProps) {
  const classes = useStyles();
  const { movieId, createdAt, value } = rating;
  const [movie] = useMovie(movieId);
  let primaryText = (movie && (movie.title || movie.originalTitle)) || '(unknown)';
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
  const children = (
    <>
      <ListItemText primary={primaryText} secondary={secondaryText} />
      <ListItemSecondaryAction className={classes.secondaryAction}>
        <StarIcon />
        <Typography>{value || '?'}</Typography>
      </ListItemSecondaryAction>
    </>
  );
  if (linkUrl) {
    return (
      <ListItem component="a" button href={linkUrl} target="_blank" rel="noopener">
        {children}
      </ListItem>
    );
  }
  return <ListItem>{children}</ListItem>;
}

function RatingList({ userId }: RatingListProps) {
  const [ratings, isLoading] = useUserRatings(userId);
  const [selectedOrdering, setOrdering] = React.useState('createdAt,desc');
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!ratings) {
    return null;
  }
  const [ordering, direction] = selectedOrdering.split(',');
  const orderedRatings = order(ratings, ordering as 'createdAt' | 'value', direction as 'asc' | 'desc');
  return (
    <>
      <Select displayEmpty value={selectedOrdering} onChange={(event) => setOrdering(event.target.value as Ordering)}>
        <MenuItem value="createdAt,desc">Latest first</MenuItem>
        <MenuItem value="createdAt,asc">Oldest first</MenuItem>
        <MenuItem value="value,desc">Top rated first</MenuItem>
        <MenuItem value="value,asc">Bottom rated first</MenuItem>
      </Select>
      <List dense>
        {orderedRatings.map((rating) => (
          <RatingListItem key={rating.movieId} rating={rating} />
        ))}
      </List>
    </>
  );
}

export default RatingList;
