import { Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useDeletePollParticipant from '../hooks/useDeletePollParticipant';
import useDeleteUserPoll from '../hooks/useDeleteUserPoll';
import usePoll from '../hooks/usePoll';
import usePollParticipants from '../hooks/usePollParticipants';
import useTitle from '../hooks/useTitle';
import useUpdateUserPoll from '../hooks/useUpdateUserPoll';
import useUserId from '../hooks/useUserId';
import Layout from './Layout';
import MovieCandidateList from './MovieCandidateList';
import MovieSearch from './MovieSearch';
import ParticipantList from './ParticipantList';
import PromptModal from './PromptModal';
import { useRequireAuth } from './SignInDialogProvider';
import HorizontalLayout from './layout/HorizontalLayout';
import VerticalFlow from './layout/VerticalFlow';

type CandidateSorting = 'unvoted' | 'top';

function PollView() {
  const { pollId } = useParams<'pollId'>();
  if (!pollId) {
    throw new Error('Missing poll ID!');
  }
  const navigate = useNavigate();
  const userId = useUserId();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [sorting, setSorting] = useState<CandidateSorting>('unvoted');
  const requireAuth = useRequireAuth();
  const [poll] = usePoll(pollId);
  const [participants] = usePollParticipants(pollId);
  useTitle((poll && poll.title) || `Movie poll`);
  const updatePoll = useUpdateUserPoll();
  const deletePoll = useDeleteUserPoll();
  const deletePollParticipant = useDeletePollParticipant();
  const openUpdateModal = () => setIsUpdateModalOpen(true);
  const closeUpdateModal = () => setIsUpdateModalOpen(false);
  const onModalSubmit = async (title: string) => {
    closeUpdateModal();
    await updatePoll({ ...poll!, title });
  };
  const onDeleteClick = async () => {
    const auth = await requireAuth();
    await deletePoll({ id: pollId, profileId: auth.uid });
    navigate('/');
  };
  const onLeaveClick = async () => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Are you sure you want to unparticipate this poll?`)) {
      const auth = await requireAuth();
      await deletePollParticipant({ pollId, profileId: auth.uid });
    }
  };
  const menu =
    poll && userId && userId === poll.profileId
      ? [
          <MenuItem key="rename" onClick={openUpdateModal}>
            Rename poll
          </MenuItem>,
          <MenuItem key="delete" onClick={onDeleteClick}>
            Delete poll
          </MenuItem>,
        ]
      : null;
  const isParticipating = !!userId && !!participants && participants.some(({ profileId }) => userId === profileId);
  return (
    <Layout title={(poll && poll.title) || ''} menu={menu}>
      <Grid container direction="row-reverse" justifyContent="center" spacing={4}>
        <Grid item md={3} sm={10} xs={12}>
          <Grid container direction="row" spacing={4} alignItems="center">
            <Grid item sm={8} xs={12} md={12}>
              <VerticalFlow>
                <Typography variant="subtitle1">Participants</Typography>
                <ParticipantList pollId={pollId} />
              </VerticalFlow>
            </Grid>
            <Grid item sm={4} xs={12} md={12}>
              {!isParticipating ? null : (
                <div>
                  <Button size="small" onClick={onLeaveClick}>
                    Leave the poll
                  </Button>
                </div>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={9} sm={10} xs={12}>
          <MovieSearch pollId={pollId} key={pollId}>
            <HorizontalLayout
              align="bottom"
              right={
                <Select
                  displayEmpty
                  value={sorting}
                  onChange={(event) => setSorting(event.target.value as CandidateSorting)}
                  size="small"
                >
                  <MenuItem value="unvoted">Unvoted first</MenuItem>
                  <MenuItem value="top">Top voted first</MenuItem>
                </Select>
              }
            >
              <Typography variant="h5">Suggested movies</Typography>
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
        title="Rename the list"
        label="List name"
        closeButtonText="Cancel"
        submitButtonText="Rename"
      />
    </Layout>
  );
}

export default PollView;
