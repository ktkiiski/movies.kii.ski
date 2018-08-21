import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { renderUserCollection } from 'broilerkit/react/api';
import { order } from 'broilerkit/utils/arrays';
import * as React from 'react';
import { api } from '../client';
import { router } from '../router';

const PollListBase = renderUserCollection(api.userPollCollection, {
    ordering: 'createdAt',
    direction: 'asc',
});

class PollList extends PollListBase {
    public render() {
        const {isComplete, items} = this.state;
        if (items == null) {
            return <ListItem>
                <Typography variant='caption'>Sign in to see your polls</Typography>
            </ListItem>;
        }
        const sortedItems = order(items, 'title', 'asc');
        return <>
            <List>
                {sortedItems.map((poll) => (
                    <ListItem
                        key={poll.id}
                        button
                        onClick={(event) => {
                            router.push('showPoll', {pollId: poll.id});
                            event.preventDefault();
                        }}
                        component='a'
                        href={router.buildUrl('showPoll', {pollId: poll.id})}>
                        <ListItemText primary={poll.title} />
                    </ListItem>
                ))}
            </List>
            {isComplete ? null : <CircularProgress />}
        </>;
    }
}

export default PollList;
