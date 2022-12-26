import { makeStyles } from '@material-ui/core';
import * as React from 'react';
import usePollParticipants from '../hooks/usePollParticipants';
import ProfileVoteAvatar from './ProfileVoteAvatar';

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  avatar: {
    marginRight: spacing(1),
    marginBottom: spacing(1),
  },
}));

interface ParticipantListProps {
  pollId: string;
}

function ParticipantList({ pollId }: ParticipantListProps) {
  const classes = useStyles();
  const [participants, isLoading] = usePollParticipants(pollId);
  if (isLoading) {
    return null;
  }
  return (
    <div className={classes.container}>
      {participants.map((participant) => (
        <div className={classes.avatar} key={participant.profileId}>
          <ProfileVoteAvatar pollId={pollId} participant={participant} />
        </div>
      ))}
    </div>
  );
}

export default React.memo(ParticipantList);
