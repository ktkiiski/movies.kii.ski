import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import useUser from '../hooks/useUser';

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
  const user = useUser();
  return user ? (
    <ProfileContainer>
      <Typography variant="h6">{user.displayName}</Typography>
      <Typography variant="subtitle1">{user.email}</Typography>
    </ProfileContainer>
  ) : null;
}

export default Profile;
