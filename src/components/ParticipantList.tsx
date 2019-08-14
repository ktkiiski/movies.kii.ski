import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { useList } from 'broilerkit/react/api';
import { isNotNully } from 'broilerkit/utils/compare';
import * as React from 'react';
import { listPollParticipants } from '../api';
import ProfileVoteAvatar from './ProfileVoteAvatar';

const styles = ({ spacing }: Theme) => createStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  avatar: {
    marginRight: spacing(1),
    marginBottom: spacing(1),
  },
});

interface ParticipantListProps extends WithStyles<typeof styles> {
  pollId: string;
}

function ParticipantList({ pollId, classes }: ParticipantListProps) {
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

export default React.memo(withStyles(styles)(ParticipantList));
