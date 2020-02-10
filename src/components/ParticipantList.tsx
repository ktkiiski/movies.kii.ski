import { makeStyles } from '@material-ui/core';
import { useList } from 'broilerkit/react/api';
import isNotNully from 'immuton/isNotNully';
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
  const profiles = participants.map(({ profile }) => profile).filter(isNotNully);
  return <div className={classes.container}>{
    profiles.map((profile) => (
      <div className={classes.avatar} key={profile.id}>
        <ProfileVoteAvatar pollId={pollId} user={profile} />
      </div>
    ))}
  </div>;
}

export default React.memo(ParticipantList);
