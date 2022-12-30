import SeenIcon from '@mui/icons-material/CheckBox';
import NegativeIcon from '@mui/icons-material/ThumbDown';
import PositiveIcon from '@mui/icons-material/ThumbUp';
import NeutralIcon from '@mui/icons-material/ThumbsUpDown';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TableRow from '@mui/material/TableRow';
import { green, red, yellow } from '@mui/material/colors';
import makeStyles from '@mui/styles/makeStyles';
import usePollParticipants from '../hooks/usePollParticipants';
import usePollRatings from '../hooks/usePollRatings';
import usePollVotes from '../hooks/usePollVotes';
import { getMovieScore } from '../scoring';
import ProfileAvatar from './ProfileAvatar';

const useStyles = makeStyles({
  table: {
    tableLayout: 'fixed',
  },
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

interface VoteTableProps {
  pollId: string;
  movieId: number;
}

function VoteTable({ pollId, movieId }: VoteTableProps) {
  const classes = useStyles();
  const [pollRatings] = usePollRatings(pollId);
  const ratings = pollRatings.filter((rating) => rating.movieId === movieId);
  const [pollVotes] = usePollVotes(pollId);
  const movieVotes = pollVotes.filter((vote) => vote.movieId === movieId);
  const [pollParticipants] = usePollParticipants(pollId);
  const participantIds = pollParticipants ? pollParticipants.map(({ profileId }) => profileId) : [];
  const score = getMovieScore(movieId, movieVotes || [], participantIds);
  const positiveVotes = (movieVotes || []).filter((vote) => vote.value === 1);
  const neutralVotes = (movieVotes || []).filter((vote) => vote.value === 0);
  const negativeVotes = (movieVotes || []).filter((vote) => vote.value === -1);
  const sum = (movieVotes || []).reduce((total, vote) => vote.value + total, 0);

  return (
    <Table size="small" className={classes.table}>
      <TableBody>
        <TableRow>
          <TableCell className={`${classes.headerColumn} ${classes.positiveColumn}`} component="th">
            <PositiveIcon />
          </TableCell>
          <TableCell className={`${classes.votesColumn} ${classes.positiveColumn}`}>
            {positiveVotes &&
              positiveVotes.map((vote) => (
                <ProfileAvatar
                  className={classes.avatar}
                  key={vote.profileId}
                  profileId={vote.profileId}
                  size={22}
                  fade={green[400]}
                />
              ))}
          </TableCell>
          <TableCell className={`${classes.sumColumn} ${classes.positiveColumn}`} align="right">
            {positiveVotes && positiveVotes.length}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={`${classes.headerColumn} ${classes.neutralColumn}`} component="th">
            <NeutralIcon />
          </TableCell>
          <TableCell className={`${classes.votesColumn} ${classes.neutralColumn}`}>
            {neutralVotes &&
              neutralVotes.map((vote) => (
                <ProfileAvatar
                  className={classes.avatar}
                  key={vote.profileId}
                  profileId={vote.profileId}
                  size={22}
                  fade={yellow[400]}
                />
              ))}
          </TableCell>
          <TableCell className={`${classes.sumColumn} ${classes.neutralColumn}`} align="right">
            {neutralVotes && neutralVotes.length}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={`${classes.headerColumn} ${classes.negativeColumn}`} component="th">
            <NegativeIcon />
          </TableCell>
          <TableCell className={`${classes.votesColumn} ${classes.negativeColumn}`}>
            {negativeVotes &&
              negativeVotes.map((vote) => (
                <ProfileAvatar
                  className={classes.avatar}
                  key={vote.profileId}
                  profileId={vote.profileId}
                  size={22}
                  fade={red[400]}
                />
              ))}
          </TableCell>
          <TableCell className={`${classes.sumColumn} ${classes.negativeColumn}`} align="right">
            {negativeVotes && negativeVotes.length}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className={classes.headerColumn} component="th">
            <SeenIcon />
          </TableCell>
          <TableCell className={classes.votesColumn}>
            {ratings &&
              ratings.map((rating) => (
                <ProfileAvatar
                  className={classes.avatar}
                  key={rating.profileId}
                  profileId={rating.profileId}
                  size={22}
                />
              ))}
          </TableCell>
          <TableCell className={classes.sumColumn} align="right">
            {ratings && ratings.length}
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className={`${classes.headerColumn} ${classes.footer}`}>Score</TableCell>
          <TableCell colSpan={2} className={classes.footer} align="right">
            {sum}
            {typeof score === 'number' ? ` = ${Math.round(score)}%` : null}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default VoteTable;
