import { NotFound } from 'broilerkit/http';
import { identifier } from 'broilerkit/id';
import { requestJson } from 'broilerkit/request';
import { retryRequestWithBackoff } from 'broilerkit/retry';
import { Movie, MovieSearchResult } from './resources';

async function requestTMDB(url: string, query: {[key: string]: string}): Promise<any> {
  const { data } = await retryRequestWithBackoff(20, (retryCount) => {
    if (retryCount > 0) {
      // tslint:disable-next-line:no-console
      console.warn(`Retrying request to ${url} with attempt ${retryCount}`);
    }
    return requestJson({ method: 'GET', url, query });
  });
  return data;
}

export async function retrieveMovie(id: number, apiKey: string): Promise<Movie> {
  const now = new Date();
  try {
    const data = await requestTMDB(`https://api.themoviedb.org/3/movie/${id}`, {
      api_key: apiKey,
    });
    return Movie.deserialize({
      id: data.id,
      type: 'movie',
      version: identifier(now),
      createdAt: now.toISOString(),  // TODO: Do not overwrite this!
      updatedAt: now.toISOString(),
      budget: data.budget,
      genres: (data.genres || []).map((genre: any) => genre.name), // TODO: Genre IDs?
      homePageUrl: data.homepage || null,
      imdbId: data.imdb_id || null,
      originalTitle: data.original_title || null,
      overview: data.overview && data.overview.slice(0, 1000) || '',
      popularity: data.popularity,
      releasedOn: data.release_date || null,
      isAdult: data.adult,
      revenue: data.revenue,
      runtime: data.runtime,
      tagline: data.tagline || '',
      title: data.title,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      languages: (data.spoken_languages as any[] || [])
        .map((lang) => lang.name as string)
        .filter((lang) => !!lang), // TODO: Language codes?
      backdropPath: data.backdrop_path,
      posterPath: data.poster_path,
    });
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(`Failed to retrieve movie ${id}`, error);
    throw new NotFound(`Movie not found`);
  }
}

export async function retrieveSeries(id: number, apiKey: string, imdbId: string): Promise<Movie> {
  const now = new Date();
  try {
    const data = await requestTMDB(`https://api.themoviedb.org/3/tv/${id}`, {
      api_key: apiKey,
    });
    return Movie.deserialize({
      id: data.id,
      type: 'series',
      version: identifier(now),
      createdAt: now.toISOString(),  // TODO: Do not overwrite this!
      updatedAt: now.toISOString(),
      budget: null,
      genres: (data.genres || []).map((genre: any) => genre.name), // TODO: Genre IDs?
      homePageUrl: data.homepage || null,
      imdbId,
      originalTitle: data.original_name || null,
      overview: data.overview && data.overview.slice(0, 1000) || '',
      popularity: data.popularity,
      releasedOn: data.first_air_date || null,
      isAdult: null,
      revenue: null,
      runtime: null,
      tagline: '',
      title: data.name,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      languages: (data.languages as string[] || []).filter((lang) => !!lang),
      backdropPath: data.backdrop_path,
      posterPath: data.poster_path,
    });
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(`Failed to retrieve TV series ${id}`, error);
    throw new NotFound(`TV series not found`);
  }
}

export async function retrieveMovieByImdbId(imdbId: string, apiKey: string): Promise<Movie> {
  try {
    const data = await requestTMDB(`https://api.themoviedb.org/3/find/${imdbId}`, {
      external_source: 'imdb_id',
      api_key: apiKey,
    });
    // TODO: TV-Series result
    const movieResult = data.movie_results[0];
    if (movieResult) {
      // Retrieve as a movie
      return retrieveMovie(movieResult.id, apiKey);
    }
    const seriesResult = data.tv_results[0];
    if (seriesResult) {
      // Retrieve as a TV series
      return retrieveSeries(seriesResult.id, apiKey, imdbId);
    }
    throw new Error(`Could not find a movie/series with IMDb ID ${imdbId}`);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.error(`Failed to retrieve the movie by IMDb ID ${imdbId}:`, error);
    throw new NotFound(`Movie not found`);
  }
}

export async function searchMovies(query: string, apiKey: string): Promise<MovieSearchResult[]> {
  const data = await requestTMDB(`https://api.themoviedb.org/3/search/movie`, {
    api_key: apiKey, query,
  });
  const results = data.results as any[];
  return results.map(
    ({ id }, index) => MovieSearchResult.deserialize({ id, index, query }),
  );
}
