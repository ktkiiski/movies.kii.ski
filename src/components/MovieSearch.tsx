import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import { useOperation } from 'broilerkit/react/api';
import { useDebouncedValue } from 'broilerkit/react/hooks';
import { useCallback, useMemo, useState } from 'react';
import * as React from 'react';
import * as api from '../api';
import VerticalFlow from './layout/VerticalFlow';
import MovieSearchResultList from './MovieSearchResultList';

interface MovieSearchProps {
    pollId: string;
    children?: React.ReactNode;
}

function MovieSearch({pollId, children}: MovieSearchProps) {
    const [query, setQuery] = useState('');
    const search = useDebouncedValue(query, 500);
    const resetQuery = useCallback(() => setQuery(''), []);
    const inputProps = useMemo(() => {
        if (!query) {
            return undefined;
        }
        return {
            endAdornment: <InputAdornment position='end'>
                <IconButton onClick={resetQuery}>
                    <ClearIcon />
                </IconButton>
            </InputAdornment>,
        };
    }, [query]);
    const createPollParticipant = useOperation(api.createPollParticipant);
    const createPollCandidate = useOperation(api.createPollCandidate);
    const onMovieSearchResultSelect = useCallback(async (movieId: number) => {
        // tslint:disable-next-line:no-console
        console.log(`Adding movie ${movieId} as a candidate to the poll ${pollId}`);
        createPollParticipant.post({pollId});
        await createPollCandidate.post({pollId, movieId});
        resetQuery();
    }, [pollId]);
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value), []);
    return <VerticalFlow>
        <TextField
            style={{marginTop: -8}}
            label='Search for a movie'
            placeholder='Type a movie name'
            fullWidth
            margin='none'
            onChange={onChange}
            value={query || ''}
            InputProps={inputProps}
        />
        {!search ? children : <>
            <Typography variant='h5'>Search results</Typography>
            <MovieSearchResultList
                query={search}
                pollId={pollId}
                onSelect={onMovieSearchResultSelect}
            />
        </>}
    </VerticalFlow>;
}

export default MovieSearch;
