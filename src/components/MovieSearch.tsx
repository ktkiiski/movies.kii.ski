import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import { ObserverComponent } from 'broilerkit/react/observer';
import * as React from 'react';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { api } from '../client';
import VerticalFlow from './layout/VerticalFlow';
import MovieSearchResultList from './MovieSearchResultList';

interface MovieSearchState {
    query: string;
    search: string;
}

interface MovieSearchProps {
    pollId: string;
}

class MovieSearch extends ObserverComponent<MovieSearchProps, MovieSearchState> {
    public query$ = new BehaviorSubject('');
    public search$ = this.query$.pipe(
        debounceTime(500),
        startWith(''),
    );
    public state$ = combineLatest(this.query$, this.search$, (query, search) => (
        query ? {query, search} : {query, search: ''}
    ));

    private clearButton = <InputAdornment position='end'>
        <IconButton onClick={() => this.query$.next('')}>
            <ClearIcon />
        </IconButton>
    </InputAdornment>;

    public onMovieSearchResultSelect = async (movieId: number) => {
        const {pollId} = this.props;
        // tslint:disable-next-line:no-console
        console.log(`Adding movie ${movieId} as a candidate to the poll ${pollId}`);
        await api.pollCandidateCollection.post({pollId, movieId});
        this.query$.next('');
    }
    public render() {
        const {query = '', search = ''} = this.state;
        const {pollId, children} = this.props;
        return <VerticalFlow>
            <TextField
                style={{marginTop: -8}}
                label='Search for a movie'
                placeholder='Type a movie name'
                fullWidth
                margin='none'
                onChange={this.onChange}
                value={query || ''}
                InputProps={query ? {
                    endAdornment: this.clearButton,
                } : undefined}
            />
            {!search ? children : <>
                <Typography variant='h5'>Search results</Typography>
                <MovieSearchResultList
                    query={search}
                    pollId={pollId}
                    onSelect={this.onMovieSearchResultSelect}
                />
            </>}
        </VerticalFlow>;
    }
    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.query$.next(event.target.value);
    }
}

export default MovieSearch;
