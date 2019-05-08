import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { AuthUser } from 'broilerkit/auth';
import * as React from 'react';
import DropdownMenu from './DropdownMenu';
import ProfileAvatar from './ProfileAvatar';

interface TopBarProfileMenuProps {
  user: AuthUser | null;
  onLogout: () => void;
}

class TopBarProfileMenu extends React.Component<TopBarProfileMenuProps> {
  public state = {
    anchorEl: undefined as HTMLElement | undefined,
  };

  public handleOpen: React.MouseEventHandler<HTMLElement> = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  public handleClose: React.MouseEventHandler<HTMLElement> = () => {
    this.setState({ anchorEl: undefined });
  }

  public render() {
    const { user } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
        <Button onClick={this.handleOpen} color='inherit'>
          {user && <ProfileAvatar user={user} size={32} />}
          {user && <Typography style={{ marginLeft: '1em' }} color='inherit'>{user.name}</Typography>}
        </Button>
        <DropdownMenu
          id='menu-appbar'
          anchorEl={anchorEl}
          open={open}
          onClose={this.handleClose}>
          <MenuItem onClick={this.props.onLogout}>Log out</MenuItem>
        </DropdownMenu>
      </React.Fragment>
    );
  }
}

export default TopBarProfileMenu;
