import { Checkbox, createStyles, FormControlLabel, FormGroup, Hidden, Theme, withStyles, WithStyles } from '@material-ui/core';
import { identifier } from 'broilerkit/id';
import { useListWithAuth, useOperation } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';

const styles = ({spacing}: Theme) => createStyles({
    root: {
        paddingLeft: spacing.unit * 2,
    },
    labelText: {
        whiteSpace: 'nowrap',
    },
});

interface HasSeenMovieSelectionProps extends WithStyles<typeof styles> {
    style?: React.CSSProperties;
    movieId: number;
}

function HasSeenMovieSelection({movieId, classes, ...props}: HasSeenMovieSelectionProps) {
    const ratings = useListWithAuth(api.listUserRatings, {
        ordering: 'createdAt',
        direction: 'asc',
    });
    const createUserRating = useOperation(api.createUserRating, (op) => {
        const now = new Date();
        return op.postWithUserOptimistically({
            movieId,
            value: null,
            createdAt: now,
            updatedAt: now,
            version: identifier(),
        });
    });
    const destroyUserRating = useOperation(api.destroyUserRating, (op) => (
        op.deleteWithUser({movieId})
    ));
    const hasSeen = ratings && ratings.some((rating) => rating.movieId === movieId);
    if (hasSeen == null) {
        return null;
    }
    return <FormGroup className={classes.root} {...props}>
        <FormControlLabel
            control={
                <Checkbox
                    checked={hasSeen}
                    onChange={(_, checked) => {
                        if (checked) {
                            createUserRating();
                        } else {
                            destroyUserRating();
                        }
                    }}
                />
            }
            label={<span className={classes.labelText}>
                I've seen this <Hidden xsDown>movie</Hidden>
            </span>}
        />
    </FormGroup>;
}

export default withStyles(styles)(HasSeenMovieSelection);
