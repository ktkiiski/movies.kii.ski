import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import type { Auth } from 'broilerkit/auth';
import * as React from 'react';
import DropdownMenu from './DropdownMenu';
import ProfileAvatar from './ProfileAvatar';

interface TopBarProfileMenuProps {
  user: Auth | null;
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
          {user && <ProfileAvatar user={user} size={32} />}
          {user && (
            <Typography style={{ marginLeft: '1em' }} color="inherit">
              {user.name}
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
