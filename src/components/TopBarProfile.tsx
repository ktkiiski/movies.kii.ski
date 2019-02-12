import Button from '@material-ui/core/Button';
import { useAuth, useAuthClient } from 'broilerkit/react/auth';
import * as React from 'react';
import TopBarProfileMenu from './TopBarProfileMenu';

function TopBarProfile() {
    const user = useAuth();
    const signOut = useAuthClient((authClient) => authClient.signOut());
    const signIn = useAuthClient((authClient) => authClient.authenticate());
    return user
        ? <TopBarProfileMenu user={user} onLogout={signOut} />
        : <Button color='inherit' onClick={signIn}>Sign in</Button>
    ;
}

export default TopBarProfile;
