import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import order from 'immuton/order';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useUserPolls from '../hooks/useUserPolls';
import LoadingIndicator from './LoadingIndicator';

interface PollListProps {
  userId: string;
}

function PollList({ userId }: PollListProps) {
  const navigate = useNavigate();
  const [polls, isLoading] = useUserPolls(userId);
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!polls) {
    return null;
  }
  const sortedItems = order(polls, 'title', 'asc');
  return (
    <List>
      {sortedItems.map((poll) => {
        const pollUrl = `/poll/${encodeURIComponent(poll.id)}`;
        return (
          <ListItem
            key={poll.id}
            button
            onClick={(event: React.MouseEvent) => {
              navigate(pollUrl);
              event.preventDefault();
            }}
            component="a"
            href={pollUrl}
          >
            <ListItemText primary={poll.title} />
          </ListItem>
        );
      })}
    </List>
  );
}

export default PollList;
