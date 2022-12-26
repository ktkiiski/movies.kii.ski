import Button from '@material-ui/core/Button';
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import useUser from '../hooks/useUser';
import { useRequireAuth } from './SignInDialogProvider';
import TopBarProfileMenu from './TopBarProfileMenu';

function TopBarProfile() {
  const user = useUser();
  const [signOut] = useSignOut(auth);
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
