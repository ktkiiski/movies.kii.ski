import { makeStyles } from '@material-ui/core';
import { yellow } from '@material-ui/core/colors';
import Typography from '@material-ui/core/Typography';
import StarFullIcon from '@material-ui/icons/Star';
import StarEmptyIcon from '@material-ui/icons/StarBorder';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import * as React from 'react';

const useStyles = makeStyles({
  bar: {
    whiteSpace: 'nowrap',
  },
  star: {
    color: yellow[600],
    verticalAlign: 'middle',
    fontSize: '1.4em',
  },
  ratingText: {
    marginLeft: '1em',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
});

interface RatingBarProps {
  rating: string | number;
}

function RatingBar({ rating }: RatingBarProps) {
  const classes = useStyles();
  const stars: Array<React.ReactElement> = [];
  let ratingText: string;
  let halvesCount: number;
  if (typeof rating === 'number') {
    halvesCount = Math.round(rating * 2);
    ratingText = String(rating);
  } else {
    halvesCount = Math.round(parseFloat(rating) * 2);
    ratingText = rating;
  }
  while (halvesCount > 0) {
    if (halvesCount >= 2) {
      stars.push(<StarFullIcon className={classes.star} key={stars.length} />);
    } else {
      stars.push(<StarHalfIcon className={classes.star} key={stars.length} />);
    }
    halvesCount -= 2;
  }
  while (stars.length < 10) {
    stars.push(<StarEmptyIcon className={classes.star} key={stars.length} />);
  }
  return (
    <Typography color="textPrimary" className={classes.bar}>
      {stars}
      <span className={classes.ratingText}>{ratingText}</span>
    </Typography>
  );
}

export default RatingBar;
