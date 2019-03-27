import { Checkbox, createStyles, FormControlLabel, FormGroup, Hidden, Theme, withStyles, WithStyles } from '@material-ui/core';
import { identifier } from 'broilerkit/id';
import { useOperation } from 'broilerkit/react/api';
import { useRequireAuth } from 'broilerkit/react/auth';
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
    hasSeen: boolean;
}

function HasSeenMovieSelection({movieId, classes, hasSeen, ...props}: HasSeenMovieSelectionProps) {
    const requireAuth = useRequireAuth();
    const createUserRating = useOperation(api.createUserRating);
    const destroyUserRating = useOperation(api.destroyUserRating);
    const onChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        const {id: profileId} = await requireAuth();
        const {checked} = event.target;
        if (checked) {
            const now = new Date();
            return createUserRating.postOptimistically({
                movieId,
                profileId,
                value: null,
                createdAt: now,
                updatedAt: now,
                version: identifier(),
            });
        } else {
            return destroyUserRating.delete({movieId, profileId});
        }
    };
    return <FormGroup className={classes.root} {...props}>
        <FormControlLabel
            control={
                <Checkbox
                    checked={hasSeen}
                    onChange={onChange}
                />
            }
            label={<span className={classes.labelText}>
                I've seen this <Hidden xsDown>movie</Hidden>
            </span>}
        />
    </FormGroup>;
}

export default React.memo(withStyles(styles)(HasSeenMovieSelection));
