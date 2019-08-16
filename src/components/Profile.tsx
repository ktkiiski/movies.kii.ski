import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { useAuth } from 'broilerkit/react/auth';
import * as React from 'react';

const useStyles = makeStyles(({ spacing }) => ({
  profile: {
    padding: spacing(3),
  },
}));

interface ProfileContainerStyles {
  children?: React.ReactNode;
}

function ProfileContainer({ children }: ProfileContainerStyles) {
  const classes = useStyles();
  return <div className={classes.profile}>{children}</div>;
}

function Profile() {
  const user = useAuth();
  return user ?
    <ProfileContainer>
      <Typography variant='h6'>{user.name}</Typography>
      <Typography variant='subtitle1'>{user.email}</Typography>
    </ProfileContainer>
    : null;
}

export default Profile;
