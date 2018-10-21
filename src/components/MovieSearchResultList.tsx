import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import { renderCollection, renderResources } from 'broilerkit/react/api';
import * as React from 'react';
import { api } from '../client';
import Center from './layout/Center';
import LoadingIndicator from './LoadingIndicator';
import MovieCard from './MovieCard';

const MovieSearchResultListItemBase = renderResources({
    movie: api.movieResource,
});

class MovieSearchResultListItem extends MovieSearchResultListItemBase {
    public render() {
        const {movie} = this.state;
        return <MovieCard movie={movie}>{this.props.children}</MovieCard>;
    }
}

const AddMovieCandidateButtonBase = renderCollection(api.pollCandidateCollection, {
    ordering: 'createdAt',
    direction: 'asc',
});

const alreadyAddedButton = <Button size='small' color='primary' disabled>
    <CheckIcon /> Already added
</Button>;

class AddMovieCandidateButton extends AddMovieCandidateButtonBase<{movieId: number, onClick: () => void}> {

    // tslint:disable-next-line:member-ordering
    private button = <Button size='small' color='primary' onClick={this.props.onClick}>
        <AddIcon /> Suggest this movie
    </Button>;

    public render() {
        const {items, isComplete} = this.state;
        if (!items || !isComplete) {
            // We don't know yet if the movie is already added
            return null;
        }
        const isAlreadyAdded = items.some(
            (candidate) => candidate.movieId === this.props.movieId,
        );
        return isAlreadyAdded ? alreadyAddedButton : this.button;
    }
}

const MovieSearchResultListBase = renderCollection(api.queryMovieSearchResultCollection, {
    ordering: 'index',
    direction: 'asc',
});

interface MovieSearchResultListProps {
    pollId: string;
    onSelect: (movieId: number) => void;
}

class MovieSearchResultList extends MovieSearchResultListBase<MovieSearchResultListProps> {
    public render() {
        const {pollId} = this.props;
        const {items, isComplete} = this.state;
        if (!isComplete || !items) {
            return <LoadingIndicator />;
        }
        if (!items.length) {
            return (
                <Center>
                    <Typography>No results matching "{this.props.query}"!</Typography>
                </Center>
            );
        }
        return items.map((result) => (
            <MovieSearchResultListItem movie={result} key={result.id}>
                <CardActions>
                    <AddMovieCandidateButton movieId={result.id} pollId={pollId} onClick={() => {
                        this.props.onSelect(result.id);
                    }} />
                </CardActions>
            </MovieSearchResultListItem>
        ));
    }
}

export default MovieSearchResultList;
