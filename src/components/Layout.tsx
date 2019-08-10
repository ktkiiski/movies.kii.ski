import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ListIcon from '@material-ui/icons/List';
import { useOperation } from 'broilerkit/react/api';
import { useRequireAuth, useUserId } from 'broilerkit/react/auth';
import * as React from 'react';
import { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as api from '../api';
import { listRatings, showPoll } from '../routes';
import AppDrawer from './AppDrawer';
import Root from './layout/Root';
import PollList from './PollList';
import Profile from './Profile';
import PromptModal from './PromptModal';
import SignOutListItem from './SignOutListItem';
import TopBar from './TopBar';

interface LayoutProps extends RouteComponentProps {
  title: string;
  menu?: React.ReactNode;
  children?: React.ReactNode;
}

function Layout({ title, children, menu, history }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const userId = useUserId();
  const requireAuth = useRequireAuth();
  const createUserPoll = useOperation(api.createUserPoll);

  function openDrawer() {
    setIsDrawerOpen(true);
  }
  function closeDrawer() {
    setIsDrawerOpen(false);
  }
  async function openCreateModal() {
    await requireAuth();
    setIsDrawerOpen(false);
    setIsCreateModalOpen(true);
  }
  function closeCreateModal() {
    setIsCreateModalOpen(false);
  }
  async function onCreateModalSubmit(newTitle: string) {
    closeCreateModal();
    const auth = await requireAuth();
    const poll = await createUserPoll.post({
      title: newTitle,
      description: '', // TODO
      profileId: auth.id,
    });
    history.push(showPoll.compile({ pollId: poll.id }).toString());
  }

  const pollList = userId
    ? <PollList userId={userId} />
    : <ListItem><Typography variant='caption'>Sign in to see your polls</Typography></ListItem>
    ;
  const ratingListUrl = listRatings.compile({}).toString();
  return <div>
    <TopBar title={title} onMenuButtonClick={openDrawer} menu={menu} />
    <AppDrawer
      disableRestoreFocus={isCreateModalOpen}
      open={isDrawerOpen}
      onClose={closeDrawer}
    >
      <Profile />
      <Divider />
      <div onClick={closeDrawer}>{pollList}</div>
      <Divider />
      <List>
        <ListItem onClick={openCreateModal} button>
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText>Create a poll</ListItemText>
        </ListItem>
        <ListItem
          onClick={(event) => {
            history.push(ratingListUrl);
            event.preventDefault();
          }}
          button
          component='a'
          href={ratingListUrl}
        >
          <ListItemIcon><ListIcon /></ListItemIcon>
          <ListItemText>My ratings</ListItemText>
        </ListItem>
        <SignOutListItem onClick={closeDrawer}>
          <ListItemIcon><ExitToAppIcon /></ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </SignOutListItem>
      </List>
    </AppDrawer>
    <Root>{children}</Root>
    <PromptModal
      open={isCreateModalOpen}
      onClose={closeCreateModal}
      onSubmit={onCreateModalSubmit}
      title='Create a new poll'
      label='Poll name'
      closeButtonText='Close'
      submitButtonText='Create'
    />
  </div>;
}

export default withRouter(Layout);
