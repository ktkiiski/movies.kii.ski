import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import * as React from 'react';
import Dropdown from './Dropdown';
import TopBarProfile from './TopBarProfile';

const useStyles = makeStyles({
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  push: {
    height: 64,
  },
});

interface TopBarProps {
  title?: string;
  onMenuButtonClick: () => void;
  menu?: React.ReactNode;
}

function TopBar({ title, onMenuButtonClick, menu }: TopBarProps) {
  const classes = useStyles();
  return <>
    <AppBar>
      <Toolbar>
        <IconButton
          className={classes.menuButton}
          color="inherit"
          aria-label="Menu"
          onClick={onMenuButtonClick}
          size="large">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" className={classes.flex}>
          {title}
        </Typography>
        <TopBarProfile />
        {menu && (
          <Dropdown
            button={
              <IconButton color="inherit" size="large">
                <MoreVertIcon />
              </IconButton>
            }
          >
            {menu}
          </Dropdown>
        )}
      </Toolbar>
    </AppBar>
    <div className={classes.push} />
  </>;
}

export default TopBar;
