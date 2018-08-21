import { renderCollection } from 'broilerkit/react/api';
import { api } from '../client';

const VoteResultBase = renderCollection(api.pollVoteCollection, {
    ordering: 'createdAt',
    direction: 'asc',
});

interface VoteTableProps {
    pollId: string;
    movieId: number;
}

class VoteSum extends VoteResultBase<VoteTableProps> {
    public render() {
        const {movieId} = this.props;
        const votes = this.state.items;
        if (!votes || !this.state.isComplete) {
            return null;
        }
        const movieVotes = votes.filter((vote) => vote.movieId === movieId);
        return movieVotes.reduce((sum, vote) => vote.value + sum, 0);
    }
}

export default VoteSum;
