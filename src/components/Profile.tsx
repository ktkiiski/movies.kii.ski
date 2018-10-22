import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { renderUser } from 'broilerkit/react/observer';
import * as React from 'react';
import { authClient } from '../client';

const styles = ({spacing}: Theme) => createStyles({
    profile: {
        padding: spacing.unit * 3,
    },
});

interface ProfileContainerStyles extends WithStyles<typeof styles> {
    children?: React.ReactNode;
}

const ProfileContainer = withStyles(styles)(({classes, children}: ProfileContainerStyles) => (
    <div className={classes.profile}>{children}</div>
));

class Profile extends renderUser(authClient) {
    public render() {
        const {user} = this.state;
        return user ?
            <ProfileContainer>
                <Typography variant='h6'>{user.name}</Typography>
                <Typography variant='subtitle1'>{user.email}</Typography>
            </ProfileContainer>
            : null
        ;
    }
}

export default Profile;
