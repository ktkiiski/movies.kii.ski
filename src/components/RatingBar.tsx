import StarFullIcon from '@mui/icons-material/Star';
import StarEmptyIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import Typography from '@mui/material/Typography';
import { yellow } from '@mui/material/colors';
import makeStyles from '@mui/styles/makeStyles';
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
