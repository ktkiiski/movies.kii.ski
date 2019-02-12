import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { useOperation } from 'broilerkit/react/api';
import { useAuthClient } from 'broilerkit/react/auth';
import * as React from 'react';
import { useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as api from '../api';
import { showPoll } from '../routes';
import AppDrawer from './AppDrawer';
import PollList from './PollList';
import Profile from './Profile';
import PromptModal from './PromptModal';
import SignOutListItem from './SignOutListItem';
import TopBar from './TopBar';

const styles = ({spacing}: Theme) => createStyles({
    root: {
        padding: spacing.unit * 2,
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 1024,
    },
});

interface LayoutProps extends WithStyles<typeof styles>, RouteComponentProps {
    title: string;
    menu?: React.ReactNode;
    children?: React.ReactNode;
}

function Layout({title, children, menu, classes, history}: LayoutProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const demandAuthentication = useAuthClient((authClient) => (
        authClient.demandAuthentication()
    ));
    const createUserPoll = useOperation(api.createUserPoll, (op, newTitle: string) => (
        op.postWithUser({
            title: newTitle,
            description: '', // TODO
        })
    ));

    function openDrawer() {
        setIsDrawerOpen(true);
    }
    function closeDrawer() {
        setIsDrawerOpen(false);
    }
    async function openCreateModal() {
        await demandAuthentication();
        setIsDrawerOpen(false);
        setIsCreateModalOpen(true);
    }
    function closeCreateModal() {
        setIsCreateModalOpen(false);
    }
    async function onCreateModalSubmit(newTitle: string) {
        closeCreateModal();
        const poll = await createUserPoll(newTitle);
        history.push(showPoll.compile({pollId: poll.id}).toString());
    }

    return <>
        <TopBar title={title} onMenuButtonClick={openDrawer} menu={menu} />
        <AppDrawer
            disableRestoreFocus={isCreateModalOpen}
            open={isDrawerOpen}
            onClose={closeDrawer}
        >
            <Profile />
            <Divider />
            <div onClick={closeDrawer}>
                <PollList />
            </div>
            <Divider />
            <List>
                <ListItem onClick={openCreateModal} button>
                    <ListItemIcon><AddIcon /></ListItemIcon>
                    <ListItemText>Create a poll</ListItemText>
                </ListItem>
                <SignOutListItem onClick={closeDrawer}>
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText>Sign out</ListItemText>
                </SignOutListItem>
            </List>
        </AppDrawer>
        <div className={classes.root}>{children}</div>
        <PromptModal
            open={isCreateModalOpen}
            onClose={closeCreateModal}
            onSubmit={onCreateModalSubmit}
            title='Create a new poll'
            label='Poll name'
            closeButtonText='Close'
            submitButtonText='Create'
        />
    </>;
}

export default withStyles(styles)(withRouter(Layout));
