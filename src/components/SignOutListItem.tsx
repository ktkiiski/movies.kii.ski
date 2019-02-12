import ListItem from '@material-ui/core/ListItem';
import { useAuth, useAuthClient } from 'broilerkit/react/auth';
import * as React from 'react';

interface SignOutListItemProps {
    onClick?: React.MouseEventHandler<HTMLElement>;
    children?: React.ReactNode;
}

function SignOutListItem({onClick, children}: SignOutListItemProps) {
    const user = useAuth();
    const onItemClick = useAuthClient((authClient, event: React.MouseEvent<HTMLElement>) => {
        authClient.signOut();
        if (onClick) {
            onClick(event);
        }
    });
    return user ? <ListItem onClick={onItemClick} button>{children}</ListItem> : null;
}

export default SignOutListItem;
