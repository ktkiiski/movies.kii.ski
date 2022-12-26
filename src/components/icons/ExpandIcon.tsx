import { makeStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  expand: {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  expandClosed: {
    transform: 'rotate(0deg)',
  },
}));

interface ExpandIconProps {
  up: boolean;
}

function ExpandIcon({ up }: ExpandIconProps) {
  const classes = useStyles();
  return <ExpandMoreIcon className={`${classes.expand} ${up ? classes.expandOpen : classes.expandClosed}`} />;
}

export default ExpandIcon;
