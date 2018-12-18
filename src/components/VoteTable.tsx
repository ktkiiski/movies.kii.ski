import { green, red, yellow } from '@material-ui/core/colors';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import SeenIcon from '@material-ui/icons/CheckBox';
import NegativeIcon from '@material-ui/icons/ThumbDown';
import NeutralIcon from '@material-ui/icons/ThumbsUpDown';
import PositiveIcon from '@material-ui/icons/ThumbUp';
import { ObserverComponent } from 'broilerkit/react/observer';
import { isEqual } from 'broilerkit/utils/compare';
import * as React from 'react';
import { combineLatest, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { api } from '../client';
import { DetailedRating, DetailedVote } from '../resources';
import { getMovieScore, getPollRatings$ } from '../scoring';
import ProfileAvatar from './ProfileAvatar';

const styles = createStyles({
    avatar: {
        float: 'left',
        marginRight: 5,
    },
    positiveColumn: {
        color: green[400],
        height: 'auto',
    },
    neutralColumn: {
        color: yellow[800],
        height: 'auto',
    },
    negativeColumn: {
        color: red[400],
        height: 'auto',
    },
    headerColumn: {
        width: '2em',
    },
    votesColumn: {
        textAlign: 'left',
    },
    sumColumn: {
        width: '3em',
        fontSize: '16px',
    },
    footer: {
        fontSize: '16px',
        fontWeight: 'bold',
    },
});

interface VoteTableProps extends WithStyles<typeof styles> {
    pollId: string;
    movieId: number;
}

interface VoteTableState {
    positiveVotes: DetailedVote[];
    negativeVotes: DetailedVote[];
    neutralVotes: DetailedVote[];
    ratings: DetailedRating[];
    score: number;
    sum: number;
}

class VoteTable extends ObserverComponent<VoteTableProps, VoteTableState> {

    public ratings$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => getPollRatings$(pollId)),
        combineLatest(
            this.pluckProp('movieId'),
            (ratings, movieId) => ratings.filter((rating) => rating.movieId === movieId),
        ),
        distinctUntilChanged(isEqual),
    );
    public candidates$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollCandidateCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'})),
    );
    public votes$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollVoteCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'})),
    );
    public participantIds$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => api.pollParticipantCollection.observeAll({pollId, ordering: 'createdAt', direction: 'asc'})),
        map((participants) => participants.map(({profileId}) => profileId)),
    );
    public score$ = this.pluckProp('movieId').pipe(
        combineLatest(
            this.participantIds$, this.votes$,
            (movieId, participantIds, votes) => getMovieScore(movieId, votes, participantIds),
        ),
    );
    public state$ = this.votes$.pipe(
        combineLatest(
            this.pluckProp('movieId'),
            (votes, movieId) => votes.filter((vote) => vote.movieId === movieId),
        ),
        distinctUntilChanged(isEqual),
        combineLatest(
            this.ratings$,
            this.score$,
            (votes, ratings, score) => ({
                ratings, score,
                positiveVotes: votes.filter((vote) => vote.value === 1),
                neutralVotes: votes.filter((vote) => vote.value === 0),
                negativeVotes: votes.filter((vote) => vote.value === -1),
                sum: votes.reduce((sum, vote) => vote.value + sum, 0),
            }),
        ),
    );

    public render() {
        const {classes} = this.props;
        const {positiveVotes, neutralVotes, negativeVotes, ratings, sum, score} = this.state;
        return <Table>
            <TableBody>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn + ' ' + classes.positiveColumn} component='th'>
                        <PositiveIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn + ' ' + classes.positiveColumn}>
                        {positiveVotes && positiveVotes.map((vote) => (
                            vote.profile && vote.profile.picture &&
                                <ProfileAvatar className={classes.avatar} key={vote.profileId} user={vote.profile} size={22} fade={green[400]} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.positiveColumn} numeric>
                        {positiveVotes && positiveVotes.length}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn + ' ' + classes.neutralColumn} component='th'>
                        <NeutralIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn + ' ' + classes.neutralColumn}>
                        {neutralVotes && neutralVotes.map((vote) => (
                            vote.profile && vote.profile.picture &&
                                <ProfileAvatar className={classes.avatar} key={vote.profileId} user={vote.profile} size={22} fade={yellow[400]} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.neutralColumn} numeric>
                        {neutralVotes && neutralVotes.length}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn + ' ' + classes.negativeColumn} component='th'>
                        <NegativeIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn + ' ' + classes.negativeColumn}>
                        {negativeVotes && negativeVotes.map((vote) => (
                            vote.profile && vote.profile.picture &&
                                <ProfileAvatar className={classes.avatar} key={vote.profileId} user={vote.profile} size={22} fade={red[400]} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.negativeColumn} numeric>
                        {negativeVotes && negativeVotes.length}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn} component='th'>
                        <SeenIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn}>
                        {ratings && ratings.map((rating) => (
                            rating.profile && rating.profile.picture &&
                                <ProfileAvatar className={classes.avatar} key={rating.profileId} user={rating.profile} size={22} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn} numeric>
                        {ratings && ratings.length}
                    </TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell padding={'dense'} className={`${classes.headerColumn} ${classes.footer}`}>
                        Score
                    </TableCell>
                    <TableCell colSpan={2} padding={'dense'} className={classes.footer} numeric>
                        {sum}{typeof score === 'number' ? ` = ${Math.round(score)}%` : null}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>;
    }
}

export default withStyles(styles)(VoteTable);
