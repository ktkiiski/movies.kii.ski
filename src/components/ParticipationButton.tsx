import Button from '@material-ui/core/Button';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { map, switchMap } from 'rxjs/operators';
import { api } from '../client';
import { DetailedParticipant } from '../resources';

const styles = ({}: Theme) => createStyles({});

interface ParticipationButtonProps extends WithStyles<typeof styles> {
    pollId: string;
}

interface ParticipantListState {
    participants: DetailedParticipant[];
}

class ParticipationButton extends ObserverComponent<ParticipationButtonProps, ParticipantListState> {

    public state$ = this.pluckProp('pollId').pipe(
        switchMap((pollId) => (
            api.pollParticipantCollection.observeAll({
                pollId, ordering: 'createdAt', direction: 'asc',
            })
        )),
        map((participants) => ({participants})),
    );

    public render() {
        const {participants} = this.state;
        if (!participants) {
            return null;
        }
        return <Button>Join the poll</Button>;
    }
}

export default withStyles(styles)(ParticipationButton);
