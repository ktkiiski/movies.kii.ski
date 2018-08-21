import Button from '@material-ui/core/Button';
import { renderUser } from 'broilerkit/react/observer';
import * as React from 'react';
import { authClient } from '../client';
import TopBarProfileMenu from './TopBarProfileMenu';

class TopBarProfile extends renderUser(authClient) {
    public render() {
        const {user} = this.state;
        return user
            ? <TopBarProfileMenu user={user} onLogout={() => authClient.signOut()} />
            : <Button color='inherit' onClick={() => authClient.authenticate()}>Sign in</Button>
        ;
    }
}

export default TopBarProfile;
