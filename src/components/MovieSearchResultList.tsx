import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import * as React from 'react';
import useMovie from '../hooks/useMovie';
import useMovieSearchResults from '../hooks/useMovieSearchResults';
import usePollCandidates from '../hooks/usePollCandidates';
import LoadingIndicator from './LoadingIndicator';
import MovieCard from './MovieCard';
import Center from './layout/Center';

interface MovieSearchResultListItemProps {
  movieId: number;
  children?: React.ReactNode;
}

function MovieSearchResultListItem(props: MovieSearchResultListItemProps) {
  const { movieId, children } = props;
  const [movie] = useMovie(movieId);
  return <MovieCard movie={movie}>{children}</MovieCard>;
}

const alreadyAddedButton = (
  <Button size="small" color="primary" disabled>
    <CheckIcon /> Already added
  </Button>
);

interface AddMovieCandidateButtonProps {
  movieId: number;
  pollId: string;
  onClick: () => void;
}

function AddMovieCandidateButton({ pollId, movieId, onClick }: AddMovieCandidateButtonProps) {
  const [pollCandidates, isLoading] = usePollCandidates(pollId);
  if (isLoading) {
    // We don't know yet if the movie is already added
    return null;
  }
  const isAlreadyAdded = pollCandidates.some((candidate) => candidate.movieId === movieId);
  if (isAlreadyAdded) {
    return alreadyAddedButton;
  }
  return (
    <Button size="small" color="primary" onClick={onClick}>
      <AddIcon /> Suggest this movie
    </Button>
  );
}

interface MovieSearchResultListProps {
  query: string;
  pollId: string;
  onSelect: (movieId: number) => void;
}

function MovieSearchResultList({ pollId, query, onSelect }: MovieSearchResultListProps) {
  const [searchResults, isSearching] = useMovieSearchResults(query);
  if (isSearching) {
    return <LoadingIndicator />;
  }
  if (!searchResults.length) {
    return (
      <Center>
        <Typography>{`No results matching "${query}"!`}</Typography>
      </Center>
    );
  }
  return (
    <>
      {searchResults.map((result) => (
        <MovieSearchResultListItem movieId={result.id} key={result.id}>
          <CardActions>
            <AddMovieCandidateButton movieId={result.id} pollId={pollId} onClick={() => onSelect(result.id)} />
          </CardActions>
        </MovieSearchResultListItem>
      ))}
    </>
  );
}

export default MovieSearchResultList;
