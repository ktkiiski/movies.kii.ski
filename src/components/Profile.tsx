import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { renderUser } from 'broilerkit/react/observer';
import * as React from 'react';
import { authClient } from '../client';

const stylize = withStyles<'profile', {}>(({spacing}) => ({
    profile: {
        padding: spacing.unit * 3,
    },
}));

const ProfileContainer = stylize(({classes, children}) => (
    <div className={classes.profile}>{children}</div>
));

class Profile extends renderUser(authClient) {
    public render() {
        const {user} = this.state;
        return user ?
            <ProfileContainer>
                <Typography variant='title'>{user.name}</Typography>
                <Typography variant='subheading'>{user.email}</Typography>
            </ProfileContainer>
            : null
        ;
    }
}

export default Profile;
