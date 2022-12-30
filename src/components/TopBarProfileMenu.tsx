import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { User } from 'firebase/auth';
import * as React from 'react';
import DropdownMenu from './DropdownMenu';
import PersonAvatar from './PersonAvatar';

interface TopBarProfileMenuProps {
  user: User | null;
  onLogout: () => void;
}

interface TolBarProfileMenuState {
  anchorEl: HTMLElement | undefined;
}

class TopBarProfileMenu extends React.Component<TopBarProfileMenuProps, TolBarProfileMenuState> {
  constructor(props: TopBarProfileMenuProps) {
    super(props);
    this.state = {
      anchorEl: undefined,
    };
  }

  public handleOpen: React.MouseEventHandler<HTMLElement> = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  public handleClose: React.MouseEventHandler<HTMLElement> = () => {
    this.setState({ anchorEl: undefined });
  };

  public render() {
    const { user, onLogout } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <>
        <Button onClick={this.handleOpen} color="inherit">
          {user && (
            <PersonAvatar
              user={{
                id: user.uid,
                name: user.displayName,
                picture: user.photoURL,
              }}
              size={32}
            />
          )}
          {user && (
            <Typography style={{ marginLeft: '1em' }} color="inherit">
              {user.displayName}
            </Typography>
          )}
        </Button>
        <DropdownMenu id="menu-appbar" anchorEl={anchorEl} open={open} onClose={this.handleClose}>
          <MenuItem onClick={onLogout}>Log out</MenuItem>
        </DropdownMenu>
      </>
    );
  }
}

export default TopBarProfileMenu;
