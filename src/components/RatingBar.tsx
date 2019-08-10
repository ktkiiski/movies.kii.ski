import { yellow } from '@material-ui/core/colors';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import StarFullIcon from '@material-ui/icons/Star';
import StarEmptyIcon from '@material-ui/icons/StarBorder';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import * as React from 'react';

const styles = createStyles({
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

interface RatingBarProps extends WithStyles<typeof styles> {
  rating: string | number;
}

class RatingBar extends React.PureComponent<RatingBarProps> {
  public render() {
    const stars: Array<React.ReactElement<any>> = [];
    const { rating, classes } = this.props;
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
    return <Typography className={classes.bar}>
      {stars}
      <span className={classes.ratingText}>{ratingText}</span>
    </Typography>;
  }
}

export default withStyles(styles)(RatingBar);
