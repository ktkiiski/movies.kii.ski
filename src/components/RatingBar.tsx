import { yellow } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import StarFullIcon from '@material-ui/icons/Star';
import StarEmptyIcon from '@material-ui/icons/StarBorder';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import * as React from 'react';

interface RatingBarProps {
    rating: string;
    classes: {
        bar: string;
        star: string;
        ratingText: string;
    };
}

const stylize = withStyles({
    bar: {
        whiteSpace: 'nowrap',
    },
    star: {
        color: yellow[400],
        verticalAlign: 'middle',
        fontSize: '1.4em',
    },
    ratingText: {
        marginLeft: '1em',
        display: 'inline-block',
        verticalAlign: 'middle',
    },
});

class RatingBar extends React.PureComponent<RatingBarProps> {
    public render() {
        const stars: Array<React.ReactElement<any>> = [];
        const ratingText = this.props.rating;
        const {classes} = this.props;
        let rating = Math.round(parseFloat(ratingText) * 2);
        while (rating > 0) {
            if (rating >= 2) {
                stars.push(<StarFullIcon className={classes.star} key={stars.length} />);
            } else {
                stars.push(<StarHalfIcon className={classes.star} key={stars.length} />);
            }
            rating -= 2;
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

export default stylize(RatingBar);
