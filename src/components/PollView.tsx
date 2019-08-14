import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { useList, useOperation, useResource } from 'broilerkit/react/api';
import { useRequireAuth, useUserId } from 'broilerkit/react/auth';
import { useTitle } from 'broilerkit/react/meta';
import * as React from 'react';
import { useState } from 'react';
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

function PollView({ pollId, history }: PollViewProps) {
  const userId = useUserId();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [sorting, setSorting] = useState<CandidateSorting>('unvoted');
  const requireAuth = useRequireAuth();
  const [poll] = useResource(api.retrievePoll, { id: pollId });
  const [participants] = useList(api.listPollParticipants, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  useTitle(poll && poll.title || `Movie poll`);
  const updatePoll = useOperation(api.updateUserPoll);
  const destroyPoll = useOperation(api.destroyUserPoll);
  const destroyPollParticipant = useOperation(api.destroyPollParticipant);
  const openUpdateModal = () => setIsUpdateModalOpen(true);
  const closeUpdateModal = () => setIsUpdateModalOpen(false);
  const onModalSubmit = async (title: string) => {
    closeUpdateModal();
    const auth = await requireAuth();
    await updatePoll.patch({ id: pollId, title, profileId: auth.id });
  };
  const onDeleteClick = async () => {
    const auth = await requireAuth();
    await destroyPoll.delete({ id: pollId, profileId: auth.id });
    history.push(home.compile({}).toString());
  };
  const onLeaveClick = async () => {
    if (confirm(`Are you sure you want to unparticipate this poll?`)) {
      const auth = await requireAuth();
      await destroyPollParticipant.delete({ pollId, profileId: auth.id });
    }
  };
  const menu = poll && userId && userId === poll.profileId ? [
    <MenuItem key='rename' onClick={openUpdateModal}>Rename poll</MenuItem>,
    <MenuItem key='delete' onClick={onDeleteClick}>Delete poll</MenuItem>,
  ] : null;
  const isParticipating = !!userId && !!participants && participants.some(
    ({ profileId }) => userId === profileId,
  );
  return <Layout title={poll && poll.title || ''} menu={menu}>
    <Grid container direction='row-reverse' justify='center' spacing={4}>
      <Grid item md={3} sm={10} xs={12}>
        <VerticalFlow>
          <Typography variant='subtitle1'>Participants</Typography>
          <ParticipantList pollId={pollId} />
          {isParticipating ? <Button size='small' onClick={onLeaveClick}>
            Leave from this poll
                    </Button> : null}
        </VerticalFlow>
      </Grid>
      <Grid item md={9} sm={10} xs={12}>
        <MovieSearch pollId={pollId} key={pollId}>
          <HorizontalLayout align='bottom' right={
            <Select
              displayEmpty
              value={sorting}
              onChange={(event) => setSorting(event.target.value as CandidateSorting)}
            >
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
      onSubmit={onModalSubmit}
      defaultValue={poll && poll.title}
      title='Rename the list'
      label='List name'
      closeButtonText='Cancel'
      submitButtonText='Rename'
    />
  </Layout>;
}

export default withRouter(PollView);
