import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import { useList, useResource } from 'broilerkit/react/api';
import * as React from 'react';
import * as api from '../api';
import Center from './layout/Center';
import LoadingIndicator from './LoadingIndicator';
import MovieCard from './MovieCard';

interface MovieSearchResultListItemProps {
    movieId: number;
    children?: React.ReactNode;
}

function MovieSearchResultListItem(props: MovieSearchResultListItemProps) {
    const [movie] = useResource(api.retrieveMovie, {id: props.movieId});
    return <MovieCard movie={movie}>{props.children}</MovieCard>;
}

const alreadyAddedButton = <Button size='small' color='primary' disabled>
    <CheckIcon /> Already added
</Button>;

interface AddMovieCandidateButtonProps {
    movieId: number;
    pollId: string;
    onClick: () => void;
}

function AddMovieCandidateButton({pollId, movieId, onClick}: AddMovieCandidateButtonProps) {
    const [pollCandidates] = useList(api.listPollCandidates, {
        pollId,
        ordering: 'createdAt',
        direction: 'asc',
    });
    if (!pollCandidates) {
        // We don't know yet if the movie is already added
        return null;
    }
    const isAlreadyAdded = pollCandidates.some((candidate) => candidate.movieId === movieId);
    return isAlreadyAdded ? alreadyAddedButton : <Button size='small' color='primary' onClick={onClick}>
        <AddIcon /> Suggest this movie
    </Button>;
}

interface MovieSearchResultListProps {
    query: string;
    pollId: string;
    onSelect: (movieId: number) => void;
}

function MovieSearchResultList({pollId, query, onSelect}: MovieSearchResultListProps) {
    const [searchResults] = useList(api.searchMovies, {
        query,
        ordering: 'index',
        direction: 'asc',
    });
    if (!searchResults) {
        return <LoadingIndicator />;
    }
    if (!searchResults.length) {
        return (
            <Center>
                <Typography>No results matching "{query}"!</Typography>
            </Center>
        );
    }
    return <>{searchResults.map((result) => (
        <MovieSearchResultListItem movieId={result.id} key={result.id}>
            <CardActions>
                <AddMovieCandidateButton
                    movieId={result.id}
                    pollId={pollId}
                    onClick={() => onSelect(result.id)}
                />
            </CardActions>
        </MovieSearchResultListItem>
    ))}</>;
}

export default MovieSearchResultList;
