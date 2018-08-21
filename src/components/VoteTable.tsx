import { green, red, yellow } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import NeutralIcon from '@material-ui/icons/SentimentNeutral';
import NegativeIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import PositiveIcon from '@material-ui/icons/SentimentVerySatisfied';
import { renderCollection } from 'broilerkit/react/api';
import * as React from 'react';
import { api } from '../client';
import ProfileAvatar from './ProfileAvatar';
import VoteResult from './VoteResult';
import VoteSum from './VoteSum';

const stylize = withStyles({
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
    },
    footer: {},
});

const VoteTableBase = renderCollection(api.pollVoteCollection, {
    ordering: 'createdAt',
    direction: 'asc',
});

interface VoteTableProps {
    movieId: number;
    classes: {
        positiveColumn: string;
        neutralColumn: string;
        negativeColumn: string;
        headerColumn: string;
        votesColumn: string;
        sumColumn: string;
        footer: string;
    };
}

class VoteTable extends VoteTableBase<VoteTableProps> {
    public render() {
        const {movieId, classes, pollId} = this.props;
        const votes = this.state.items;
        const movieVotes = votes && votes.filter((vote) => vote.movieId === movieId) || [];
        const positiveVotes = movieVotes.filter((vote) => vote.value === 1);
        const neutralVotes = movieVotes.filter((vote) => vote.value === 0);
        const negativeVotes = movieVotes.filter((vote) => vote.value === -1);
        return <Table>
            <TableBody>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn + ' ' + classes.positiveColumn} component='th'>
                        <PositiveIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn + ' ' + classes.positiveColumn}>
                        {positiveVotes.map((vote) => (
                            vote.profile && vote.profile.picture &&
                                <ProfileAvatar key={vote.profileId} user={vote.profile} size={18} fade={green[400]} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.positiveColumn} numeric>
                        {positiveVotes.length}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn + ' ' + classes.neutralColumn} component='th'>
                        <NeutralIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn + ' ' + classes.neutralColumn}>
                        {neutralVotes.map((vote) => (
                            vote.profile && vote.profile.picture &&
                                <ProfileAvatar key={vote.profileId} user={vote.profile} size={18} fade={yellow[400]} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.neutralColumn} numeric>
                        {neutralVotes.length}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell padding={'dense'} className={classes.headerColumn + ' ' + classes.negativeColumn} component='th'>
                        <NegativeIcon />
                    </TableCell>
                    <TableCell padding={'none'} className={classes.votesColumn + ' ' + classes.negativeColumn}>
                        {negativeVotes.map((vote) => (
                            vote.profile && vote.profile.picture &&
                                <ProfileAvatar key={vote.profileId} user={vote.profile} size={18} fade={red[400]} />
                        ))}
                    </TableCell>
                    <TableCell padding={'dense'} className={classes.sumColumn + ' ' + classes.negativeColumn} numeric>
                        {negativeVotes.length}
                    </TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} padding={'dense'} className={classes.footer} numeric>
                        <VoteResult movieId={movieId} pollId={pollId} />
                        {' / '}
                        <VoteSum movieId={movieId} pollId={pollId} />
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>;
    }
}

export default stylize(VoteTable);
