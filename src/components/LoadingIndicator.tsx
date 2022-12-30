import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  loader: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
}));

export default function LoadingIndicator() {
  const classes = useStyles();
  return (
    <div className={classes.loader}>
      <CircularProgress />
    </div>
  );
}
