import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { useListWithAuth } from 'broilerkit/react/api';
import { order } from 'broilerkit/utils/arrays';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as api from '../api';
import { showPoll } from '../routes';

function PollList({history}: RouteComponentProps) {
    const polls = useListWithAuth(api.listUserPolls, {
        ordering: 'createdAt',
        direction: 'asc',
    });
    if (!polls) {
        return <ListItem>
            <Typography variant='caption'>Sign in to see your polls</Typography>
        </ListItem>;
    }
    const sortedItems = order(polls, 'title', 'asc');
    return <>
        <List>
            {sortedItems.map((poll) => {
                const pollUrl = showPoll.compile({pollId: poll.id}).toString();
                return <ListItem
                    key={poll.id}
                    button
                    onClick={(event) => {
                        history.push(pollUrl);
                        event.preventDefault();
                    }}
                    component='a'
                    href={pollUrl}>
                    <ListItemText primary={poll.title} />
                </ListItem>;
            })}
        </List>
    </>;
}

export default withRouter(PollList);
