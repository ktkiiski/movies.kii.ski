import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { ObserverComponent } from 'broilerkit/react/observer';
import { order } from 'broilerkit/utils/arrays';
import { isNotNully } from 'broilerkit/utils/compare';
import * as React from 'react';
import { combineLatest, merge } from 'rxjs';
import { distinct, filter, map, switchMap, toArray } from 'rxjs/operators';
import { api } from '../client';
import { PublicProfile } from '../resources';
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
    participants: PublicProfile[];
}

class ParticipantList extends ObserverComponent<ParticipantListProps, ParticipantListState> {

    public state$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => {
            const candidate$$ = api.pollCandidateCollection.observeObservable({pollId, ordering: 'createdAt', direction: 'asc'});
            const vote$$ = api.pollVoteCollection.observeObservable({pollId, ordering: 'createdAt', direction: 'asc'});
            return combineLatest(
                candidate$$.pipe(
                    map((candidate$) => candidate$.pipe(
                        map((candidate) => candidate.profile),
                    )),
                ),
                vote$$.pipe(
                    map((vote$) => vote$.pipe(
                        map((vote) => vote.profile),
                    )),
                ),
                (candidateCreator$$, voter$$) => merge(candidateCreator$$, voter$$),
            );
        }),
        switchMap((user$) => user$.pipe(
            filter(isNotNully),
            distinct((profile) => profile.id),
            toArray(),
        )),
        map((users) => ({
            participants: order(users, 'id', 'asc'),
        })),
    );

    public render() {
        const {classes, pollId} = this.props;
        const {participants} = this.state;
        if (!participants) {
            return null;
        }
        return <div className={classes.container}>{
            participants.map((participant) => (
                <div className={classes.avatar} key={participant.id}>
                    <ProfileVoteAvatar pollId={pollId} user={participant} />
                </div>
            ))}
        </div>;
    }
}

export default withStyles(styles)(ParticipantList);
