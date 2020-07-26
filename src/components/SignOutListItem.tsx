import ListItem from '@material-ui/core/ListItem';
import { useAuth, useSignOut } from 'broilerkit/react/auth';
import * as React from 'react';

interface SignOutListItemProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
  children?: React.ReactNode;
}

function SignOutListItem({ onClick, children }: SignOutListItemProps) {
  const user = useAuth();
  const signOut = useSignOut();
  const onItemClick: React.MouseEventHandler<HTMLElement> = (event: React.MouseEvent<HTMLElement>) => {
    signOut();
    if (onClick) {
      onClick(event);
    }
  };
  if (!user) {
    return null;
  }
  return (
    <ListItem onClick={onItemClick} button>
      {children}
    </ListItem>
  );
}

export default SignOutListItem;
