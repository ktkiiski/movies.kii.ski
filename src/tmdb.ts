import { isErrorResponse, NotFound } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { requestJson } from 'broilerkit/request';
import { movie, Movie, MovieSearchResult, movieSearchResult } from './resources';

export async function retrieveMovie(id: number, apiKey: string): Promise<Movie> {
    const now = new Date();
    try {
        const {data} = await requestJson({
            method: 'GET',
            url: `https://api.themoviedb.org/3/movie/${id}`,
            query: {
                api_key: apiKey,
            },
        });
        return movie.deserialize({
            id: data.id,
            version: identifier(now),
            createdAt: now.toISOString(),  // TODO: Do not overwrite this!
            updatedAt: now.toISOString(),
            budget: data.budget,
            genres: (data.genres || []).map((genre: any) => genre.name), // TODO: Genre IDs?
            homePageUrl: data.homepage || null,
            imdbId: data.imdb_id || null,
            originalTitle: data.original_title || null,
            overview: data.overview || '',
            popularity: data.popularity,
            releasedOn: data.release_date || null,
            isAdult: data.adult,
            revenue: data.revenue,
            runtime: data.runtime,
            tagline: data.tagline,
            title: data.title,
            voteAverage: data.vote_average,
            voteCount: data.vote_count,
            languages: (data.spoken_languages || []).map((lang: any) => lang.name), // TODO: Language codes?
            backdropPath: data.backdrop_path,
            posterPath: data.poster_path,
        });
    } catch (error) {
        if (isErrorResponse(error)) {
            // tslint:disable-next-line:no-console
            console.error(JSON.stringify(error.data, null, 4));
        } else {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
        throw new NotFound(`Movie not found`);
    }
}

export async function searchMovies(query: string, apiKey: string): Promise<MovieSearchResult[]> {
    const response = await requestJson({
        method: 'GET',
        url: `https://api.themoviedb.org/3/search/movie`,
        query: {
            api_key: apiKey,
            query,
        },
    });
    const results = response.data.results as any[];
    return results.map(
        ({id}, index) => movieSearchResult.deserialize({id, index, query}),
    );
}
