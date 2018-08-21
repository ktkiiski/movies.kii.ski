import ListItem from '@material-ui/core/ListItem';
import { renderUser } from 'broilerkit/react/observer';
import * as React from 'react';
import { authClient } from '../client';

class SignOutListItem extends renderUser<{onClick?: React.MouseEventHandler<HTMLElement>}>(authClient) {
    public render() {
        const {user} = this.state;
        const {children} = this.props;
        return user
            ? <ListItem onClick={this.onClick} button>{children}</ListItem>
            : null
        ;
    }
    private onClick: React.MouseEventHandler<HTMLElement> = (event) => {
        const {onClick} = this.props;
        authClient.signOut();
        if (onClick) {
            onClick(event);
        }
    }
}

export default SignOutListItem;
