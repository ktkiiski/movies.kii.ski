import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useList } from 'broilerkit/react/api';
import { order } from 'broilerkit/utils/arrays';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as api from '../api';
import { showPoll } from '../routes';
import LoadingIndicator from './LoadingIndicator';

interface PollListProps extends RouteComponentProps {
  userId: string;
}

function PollList({ history, userId }: PollListProps) {
  const [polls, , isLoading] = useList(api.listUserPolls, {
    ordering: 'createdAt',
    direction: 'asc',
    profileId: userId,
  });
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!polls) {
    return null;
  }
  const sortedItems = order(polls, 'title', 'asc');
  return <List>
    {sortedItems.map((poll) => {
      const pollUrl = showPoll.compile({ pollId: poll.id }).toString();
      return <ListItem
        key={poll.id}
        button
        onClick={(event: React.MouseEvent) => {
          history.push(pollUrl);
          event.preventDefault();
        }}
        component='a'
        href={pollUrl}>
        <ListItemText primary={poll.title} />
      </ListItem>;
    })}
  </List>;
}

export default withRouter(PollList);
