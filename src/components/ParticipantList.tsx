import { withStyles } from '@material-ui/core/styles';
import { ObserverComponent } from 'broilerkit/react/observer';
import { order } from 'broilerkit/utils/arrays';
import { isNotNully } from 'broilerkit/utils/compare';
import * as React from 'react';
import { combineLatest, from, merge } from 'rxjs';
import { distinct, filter, map, switchMap, toArray } from 'rxjs/operators';
import { api } from '../client';
import { PublicProfile } from '../resources';
import ProfileAvatar from './ProfileAvatar';

interface ParticipantListProps {
    pollId: string;
    classes: {
        container: string,
        avatar: string;
    };
}

interface ParticipantListState {
    participants: PublicProfile[];
}

const stylize = withStyles(({spacing}) => ({
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    avatar: {
        marginRight: spacing.unit,
        marginBottom: spacing.unit,
    },
}));

class ParticipantList extends ObserverComponent<ParticipantListProps, ParticipantListState> {

    public state$ = from(this.pluckProp('pollId')).pipe(
        switchMap((pollId) => {
            const candidate$$ = from(
                api.pollCandidateCollection.observeObservable({pollId, ordering: 'createdAt', direction: 'asc'}),
            );
            const vote$$ = from(
                api.pollVoteCollection.observeObservable({pollId, ordering: 'createdAt', direction: 'asc'}),
            );
            return combineLatest(
                candidate$$.pipe(
                    map((candidate$) => from(candidate$).pipe(
                        map((candidate) => candidate.profile),
                    )),
                ),
                vote$$.pipe(
                    map((vote$) => from(vote$).pipe(
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
        const {classes} = this.props;
        const {participants} = this.state;
        if (!participants) {
            return null;
        }
        return <div className={classes.container}>{
            participants.map((participant) => (
                <ProfileAvatar size={24} user={participant} key={participant.id} className={classes.avatar} />
            ))}
        </div>;
    }
}

export default stylize(ParticipantList);
