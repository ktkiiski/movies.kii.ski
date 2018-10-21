import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { api, authClient } from '../client';
import { Poll } from '../resources';
import { router } from '../router';
import Layout from './Layout';
import HorizontalLayout from './layout/HorizontalLayout';
import VerticalFlow from './layout/VerticalFlow';
import MovieCandidateList from './MovieCandidateList';
import MovieSearch from './MovieSearch';
import ParticipantList from './ParticipantList';
import PromptModal from './PromptModal';

type CandidateSorting = 'unvoted' | 'top';

interface PollViewProps {
    id: string;
}

interface PollViewObservedState {
    poll?: Poll;
    userId?: string | null;
}

interface PollViewState {
    isUpdateModalOpen: boolean;
    sorting: CandidateSorting;
}

class PollView extends ObserverComponent<PollViewProps, PollViewObservedState, PollViewState> {

    public state: Partial<PollViewObservedState> & PollViewState = {
        isUpdateModalOpen: false,
        sorting: 'unvoted' as CandidateSorting,
    };

    public state$ = combineLatest(
        api.pollResource.observeSwitch(this.props$),
        authClient.userId$,
        (poll, userId) => ({poll, userId}),
    );

    public openUpdateModal = () => {
        this.setState({isUpdateModalOpen: true});
    }
    public closeUpdateModal = () => {
        this.setState({isUpdateModalOpen: false});
    }
    public onUpdateModalSubmit = async (title: string) => {
        this.closeUpdateModal();
        const {id} = this.props;
        await api.userPollResource.patchWithUser({id, title});
    }
    public deletePoll = async () => {
        const {id} = this.props;
        await api.userPollResource.deleteWithUser({id});
        router.replace('home', {});
    }
    public onOrderingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({sorting: event.target.value as CandidateSorting});
    }

    // tslint:disable-next-line:member-ordering
    private menu = [
        <MenuItem key='rename' onClick={this.openUpdateModal}>Rename poll</MenuItem>,
        <MenuItem key='delete' onClick={this.deletePoll}>Delete poll</MenuItem>,
    ];

    public render() {
        const {poll, isUpdateModalOpen, sorting, userId} = this.state;
        const pollId = this.props.id;
        const menu = poll && userId && userId === poll.profileId ? this.menu : null;
        return <Layout title={poll && poll.title || ''} menu={menu}>
            <Grid container direction='row-reverse' justify='center' spacing={16}>
                <Grid item md={3} sm={10} xs={12}>
                    <VerticalFlow>
                        <Typography variant='subheading'>Participants</Typography>
                        <ParticipantList pollId={pollId} />
                    </VerticalFlow>
                </Grid>
                <Grid item md={9} sm={10} xs={12}>
                    <MovieSearch pollId={pollId} key={pollId}>
                        <HorizontalLayout align='bottom' right={
                            <Select displayEmpty value={sorting} onChange={this.onOrderingChange}>
                                <MenuItem value={'unvoted'}>Unvoted first</MenuItem>
                                <MenuItem value={'top'}>Top voted first</MenuItem>
                            </Select>
                        }>
                            <Typography variant='headline'>Suggested movies</Typography>
                        </HorizontalLayout>
                        <MovieCandidateList pollId={pollId} sorting={sorting} />
                    </MovieSearch>
                </Grid>
            </Grid>
            <PromptModal
                open={isUpdateModalOpen}
                onClose={this.closeUpdateModal}
                onSubmit={this.onUpdateModalSubmit}
                defaultValue={poll && poll.title}
                title='Rename the list'
                label='List name'
                closeButtonText='Cancel'
                submitButtonText='Rename'
            />
        </Layout>;
    }
}

export default PollView;
