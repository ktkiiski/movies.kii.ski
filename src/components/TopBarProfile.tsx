import Button from '@material-ui/core/Button';
import { useAuth, useSignOut } from 'broilerkit/react/auth';
import * as React from 'react';
import { useRequireAuth } from './SignInDialogProvider';
import TopBarProfileMenu from './TopBarProfileMenu';

function TopBarProfile() {
  const user = useAuth();
  const signOut = useSignOut();
  const signInWithDialog = useRequireAuth();
  return user ? (
    <TopBarProfileMenu user={user} onLogout={signOut} />
  ) : (
    <Button color="inherit" onClick={signInWithDialog}>
      Sign in
    </Button>
  );
}

export default TopBarProfile;
