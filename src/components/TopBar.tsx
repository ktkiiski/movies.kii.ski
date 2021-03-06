import { makeStyles } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
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
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu" onClick={onMenuButtonClick}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.flex}>
            {title}
          </Typography>
          <TopBarProfile />
          {menu && (
            <Dropdown
              button={
                <IconButton color="inherit">
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
    </>
  );
}

export default TopBar;
