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
import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import { getMovieScore, usePollRatings } from '../scoring';
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

function VoteTable({pollId, movieId, classes}: VoteTableProps) {
    const ratings = usePollRatings(pollId, movieId);
    const [movieVotes] = useList(api.listPollVotes, {
        pollId, ordering: 'createdAt', direction: 'asc',
    }, {
        movieId,
    });
    const [pollParticipants] = useList(api.listPollParticipants, {
        pollId, ordering: 'createdAt', direction: 'asc',
    });
    const participantIds = pollParticipants ? pollParticipants.map(({profileId}) => profileId) : [];
    const score = getMovieScore(movieId, movieVotes || [], participantIds);
    const positiveVotes = (movieVotes || []).filter((vote) => vote.value === 1);
    const neutralVotes = (movieVotes || []).filter((vote) => vote.value === 0);
    const negativeVotes = (movieVotes || []).filter((vote) => vote.value === -1);
    const sum = (movieVotes || []).reduce((total, vote) => vote.value + total, 0);

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
                <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.positiveColumn} align='right'>
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
                <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.neutralColumn} align='right'>
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
                <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.negativeColumn} align='right'>
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
                            <ProfileAvatar
                                className={classes.avatar}
                                key={rating.profileId}
                                user={rating.profile} size={22}
                            />
                    ))}
                </TableCell>
                <TableCell padding={'dense'} className={classes.sumColumn} align='right'>
                    {ratings && ratings.length}
                </TableCell>
            </TableRow>
        </TableBody>
        <TableFooter>
            <TableRow>
                <TableCell padding={'dense'} className={`${classes.headerColumn} ${classes.footer}`}>
                    Score
                </TableCell>
                <TableCell colSpan={2} padding={'dense'} className={classes.footer} align='right'>
                    {sum}{typeof score === 'number' ? ` = ${Math.round(score)}%` : null}
                </TableCell>
            </TableRow>
        </TableFooter>
    </Table>;
}

export default withStyles(styles)(VoteTable);
