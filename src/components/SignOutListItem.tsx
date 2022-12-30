import ListItem from '@mui/material/ListItem';
import * as React from 'react';
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import useUser from '../hooks/useUser';

interface SignOutListItemProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
  children?: React.ReactNode;
}

function SignOutListItem({ onClick, children }: SignOutListItemProps) {
  const user = useUser();
  const [signOut] = useSignOut(auth);
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
