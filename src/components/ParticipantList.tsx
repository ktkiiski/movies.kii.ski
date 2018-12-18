import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { map, switchMap } from 'rxjs/operators';
import { api } from '../client';
import { DetailedParticipant } from '../resources';
import ProfileVoteAvatar from './ProfileVoteAvatar';

const styles = ({spacing}: Theme) => createStyles({
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    avatar: {
        marginRight: spacing.unit,
        marginBottom: spacing.unit,
    },
});

interface ParticipantListProps extends WithStyles<typeof styles> {
    pollId: string;
}

interface ParticipantListState {
    participants: DetailedParticipant[];
}

class ParticipantList extends ObserverComponent<ParticipantListProps, ParticipantListState> {

    public state$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => (
            api.pollParticipantCollection.observeAll({
                pollId, ordering: 'createdAt', direction: 'asc',
            })
        )),
        map((participants) => ({participants})),
    );

    public render() {
        const {classes, pollId} = this.props;
        const {participants} = this.state;
        if (!participants) {
            return null;
        }
        return <div className={classes.container}>{
            participants.map(({profile}) => (profile ?
                <div className={classes.avatar} key={profile.id}>
                    <ProfileVoteAvatar pollId={pollId} user={profile} />
                </div> : null
            ))}
        </div>;
    }
}

export default withStyles(styles)(ParticipantList);
