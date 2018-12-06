import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { renderUserCollection } from 'broilerkit/react/api';
import { order } from 'broilerkit/utils/arrays';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { api } from '../client';
import { showPoll } from '../routes';
import LoadingIndicator from './LoadingIndicator';

const PollListBase = renderUserCollection(api.userPollCollection, {
    ordering: 'createdAt',
    direction: 'asc',
});

class PollList extends PollListBase<RouteComponentProps> {
    public render() {
        const {history} = this.props;
        const {isComplete, items} = this.state;
        if (items == null) {
            return <ListItem>
                <Typography variant='caption'>Sign in to see your polls</Typography>
            </ListItem>;
        }
        const sortedItems = order(items, 'title', 'asc');
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
            {isComplete ? null : <LoadingIndicator />}
        </>;
    }
}

export default withRouter(PollList);
