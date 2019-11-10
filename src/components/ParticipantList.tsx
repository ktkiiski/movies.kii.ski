import { makeStyles } from '@material-ui/core';
import { useList } from 'broilerkit/react/api';
import * as React from 'react';
import { listPollParticipants } from '../api';
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
  const [participants] = useList(listPollParticipants, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  if (!participants) {
    return null;
  }
  return <div className={classes.container}>{
    participants.map(({ profile, ...participant }) => (
      !profile ? null : <div className={classes.avatar} key={participant.profileId}>
        <ProfileVoteAvatar pollId={pollId} user={profile} participant={participant} />
      </div>
    ))}
  </div>;
}

export default React.memo(ParticipantList);
