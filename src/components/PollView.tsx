import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { useList, useOperation, useResource } from 'broilerkit/react/api';
import { useUserId } from 'broilerkit/react/auth';
import { useState } from 'react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as api from '../api';
import { home } from '../routes';
import Layout from './Layout';
import HorizontalLayout from './layout/HorizontalLayout';
import VerticalFlow from './layout/VerticalFlow';
import MovieCandidateList from './MovieCandidateList';
import MovieSearch from './MovieSearch';
import ParticipantList from './ParticipantList';
import PromptModal from './PromptModal';

type CandidateSorting = 'unvoted' | 'top';

interface PollViewProps extends RouteComponentProps {
    pollId: string;
}

function PollView({pollId, history}: PollViewProps) {
    const userId = useUserId();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [sorting, setSorting] = useState<CandidateSorting>('unvoted');
    const poll = useResource(api.retrievePoll, {id: pollId});
    const participants = useList(api.listPollParticipants, {
        pollId,
        ordering: 'createdAt',
        direction: 'asc',
    });
    const openUpdateModal = () => setIsUpdateModalOpen(true);
    const closeUpdateModal = () => setIsUpdateModalOpen(false);
    const onOrderingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSorting(event.target.value as CandidateSorting);
    };
    const updatePoll = useOperation(api.updateUserPoll, async (op, title: string) => {
        closeUpdateModal();
        await op.patchWithUser({id: pollId, title});
    });
    const destroyPoll = useOperation(api.destroyUserPoll, async (op) => {
        await op.deleteWithUser({id: pollId});
        history.push(home.compile({}).toString());
    });
    const leavePoll = useOperation(api.destroyPollParticipant, async (op) => {
        if (confirm(`Are you sure you want to unparticipate this poll?`)) {
            op.deleteWithUser({pollId});
        }
    });
    const menu = poll && userId && userId === poll.profileId ? [
        <MenuItem key='rename' onClick={openUpdateModal}>Rename poll</MenuItem>,
        <MenuItem key='delete' onClick={destroyPoll}>Delete poll</MenuItem>,
    ] : null;
    const isParticipating = !!userId && !!participants && participants.some(
        ({profileId}) => userId === profileId,
    );
    return <Layout title={poll && poll.title || ''} menu={menu}>
        <Grid container direction='row-reverse' justify='center' spacing={16}>
            <Grid item md={3} sm={10} xs={12}>
                <VerticalFlow>
                    <Typography variant='subtitle1'>Participants</Typography>
                    <ParticipantList pollId={pollId} />
                    {isParticipating ? <Button size='small' onClick={leavePoll}>
                        Leave from this poll
                    </Button> : null}
                </VerticalFlow>
            </Grid>
            <Grid item md={9} sm={10} xs={12}>
                <MovieSearch pollId={pollId} key={pollId}>
                    <HorizontalLayout align='bottom' right={
                        <Select displayEmpty value={sorting} onChange={onOrderingChange}>
                            <MenuItem value={'unvoted'}>Unvoted first</MenuItem>
                            <MenuItem value={'top'}>Top voted first</MenuItem>
                        </Select>
                    }>
                        <Typography variant='h5'>Suggested movies</Typography>
                    </HorizontalLayout>
                    <MovieCandidateList pollId={pollId} sorting={sorting} />
                </MovieSearch>
            </Grid>
        </Grid>
        <PromptModal
            open={isUpdateModalOpen}
            onClose={closeUpdateModal}
            onSubmit={updatePoll}
            defaultValue={poll && poll.title}
            title='Rename the list'
            label='List name'
            closeButtonText='Cancel'
            submitButtonText='Rename'
        />
    </Layout>;
}

export default withRouter(PollView);
