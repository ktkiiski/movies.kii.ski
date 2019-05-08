import Button from '@material-ui/core/Button';
import { useAuth, useSignIn, useSignOut } from 'broilerkit/react/auth';
import * as React from 'react';
import TopBarProfileMenu from './TopBarProfileMenu';

function TopBarProfile() {
  const user = useAuth();
  const signOut = useSignOut();
  const signIn = useSignIn();
  return user
    ? <TopBarProfileMenu user={user} onLogout={signOut} />
    : <Button color='inherit' onClick={signIn}>Sign in</Button>
  ;
}

export default TopBarProfile;
