import { Checkbox, FormControlLabel, FormGroup, Hidden, withStyles } from '@material-ui/core';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { of } from 'rxjs';
import { combineLatest, map, switchMap } from 'rxjs/operators';
import { api, authClient } from '../client';

const stylize = withStyles(({spacing}) => ({
    root: {
        paddingLeft: spacing.unit * 2,
    },
    labelText: {
        whiteSpace: 'nowrap',
    },
}));

interface HasSeenMovieSelectionProps {
    movieId: number;
    classes: {
        root: string,
        labelText: string;
    };
}

interface HasSeenMovieSelectionState {
    hasSeen: boolean;
}

class HasSeenMovieSelection extends ObserverComponent<HasSeenMovieSelectionProps, HasSeenMovieSelectionState> {

    public state$ = authClient.userId$.pipe(
        switchMap((userId) => (
            userId ? api.userRatingCollection.observeAll({
                profileId: userId,
                ordering: 'createdAt',
                direction: 'asc',
            }) : of([])
        )),
        combineLatest(
            this.pluckProp('movieId'),
            (ratings, movieId) => (
                ratings.filter((rating) => rating.movieId === movieId)
            ),
        ),
        map((ratings) => ({
            hasSeen: ratings.length > 0,
        })),
    );

    public onChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const {movieId} = this.props;
        if (checked) {
            api.userRatingCollection.postWithUser({movieId, value: null});
        } else {
            api.userRatingResource.deleteWithUser({movieId});
        }
    }

    public render() {
        const {classes} = this.props;
        const {hasSeen} = this.state;
        if (hasSeen == null) {
            return null;
        }
        return <FormGroup className={classes.root}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={hasSeen}
                        onChange={this.onChange}
                    />
                }
                label={<span className={classes.labelText}>
                    I've seen this <Hidden xsDown>movie</Hidden>
                </span>}
            />
        </FormGroup>;
    }
}

export default stylize(HasSeenMovieSelection);
