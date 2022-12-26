/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { isNotNully } from 'immuton';
import { Movie, MovieSearchResult, movieSearchResultSerializer, movieSerializer } from './movies';

// const retryableStatusCodes = [503, 408, 429, 504];
// const maxRetryCount = 20;

async function requestTMDB(url: string, query: { [key: string]: string }): Promise<any> {
  const response = await fetch(`${url}?${new URLSearchParams(query)}`);
  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw response;
  }
  return response.json();
}
/*
async function requestTMDB(url: string, query: { [key: string]: string }): Promise<any> {
  let retryCount = 0;
  const startTime = new Date().getTime();

  async function assertRetry(error: any) {
    if (retryCount >= maxRetryCount) {
      // No more retries or not retryable error
      throw error;
    }
    // Retry
    retryCount += 1;
    // Wait for a random portion of the total time spent
    const totalDuration = new Date().getTime() - startTime;
    const waitDuration = Math.floor(Math.random() * totalDuration);
    await new Promise((resolve) => {
      setTimeout(resolve, waitDuration);
    });
  }

  for (;;) {
    try {
      const response = await fetch(`${url}?${new URLSearchParams(query)}`);
      if (!response.ok) {
        if (retryableStatusCodes.includes(response.status)) {
          await assertRetry(response);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw response;
        }
      }
      // eslint-disable-next-line @typescript-eslint/return-await
      return response.json();
    } catch (error) {
      await assertRetry(error);
    }
  }
}
*/

export async function retrieveMovie(id: number, apiKey: string): Promise<Movie | null> {
  const now = new Date();
  try {
    const data = await requestTMDB(`https://api.themoviedb.org/3/movie/${id}`, {
      api_key: apiKey,
    });
    return movieSerializer.deserialize({
      id: data.id,
      type: 'movie',
      createdAt: now.toISOString(), // TODO: Do not overwrite this!
      updatedAt: now.toISOString(),
      budget: data.budget,
      genres: (data.genres || []).map((genre: any) => genre.name), // TODO: Genre IDs?
      homePageUrl: data.homepage || null,
      imdbId: data.imdb_id || null,
      originalTitle: data.original_title || null,
      overview: (data.overview && data.overview.slice(0, 1000)) || '',
      popularity: data.popularity,
      releasedOn: data.release_date || null,
      isAdult: data.adult,
      revenue: data.revenue,
      runtime: data.runtime,
      tagline: data.tagline || '',
      title: data.title,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      languages: ((data.spoken_languages as any[]) || []).map((lang) => lang.name as string).filter((lang) => !!lang), // TODO: Language codes?
      backdropPath: data.backdrop_path,
      posterPath: data.poster_path,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to retrieve movie ${id}`, error);
    return null;
  }
}

export async function retrieveSeries(id: number, apiKey: string, imdbId: string): Promise<Movie | null> {
  const now = new Date();
  try {
    const data = await requestTMDB(`https://api.themoviedb.org/3/tv/${id}`, {
      api_key: apiKey,
    });
    return movieSerializer.deserialize({
      id: data.id,
      type: 'series',
      createdAt: now.toISOString(), // TODO: Do not overwrite this!
      updatedAt: now.toISOString(),
      budget: null,
      genres: (data.genres || []).map((genre: any) => genre.name), // TODO: Genre IDs?
      homePageUrl: data.homepage || null,
      imdbId,
      originalTitle: data.original_name || null,
      overview: (data.overview && data.overview.slice(0, 1000)) || '',
      popularity: data.popularity,
      releasedOn: data.first_air_date || null,
      isAdult: null,
      revenue: null,
      runtime: null,
      tagline: '',
      title: data.name,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      languages: ((data.languages as string[]) || []).filter((lang) => !!lang),
      backdropPath: data.backdrop_path,
      posterPath: data.poster_path,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to retrieve TV series ${id}`, error);
    return null;
  }
}

export async function retrieveMovieByImdbId(imdbId: string, apiKey: string): Promise<Movie | null> {
  try {
    const data = await requestTMDB(`https://api.themoviedb.org/3/find/${imdbId}`, {
      external_source: 'imdb_id',
      api_key: apiKey,
    });
    // TODO: TV-Series result
    const movieResult = data.movie_results[0];
    if (movieResult) {
      // Retrieve as a movie
      return await retrieveMovie(movieResult.id, apiKey);
    }
    const seriesResult = data.tv_results[0];
    if (seriesResult) {
      // Retrieve as a TV series
      return await retrieveSeries(seriesResult.id, apiKey, imdbId);
    }
    throw new Error(`Could not find a movie/series with IMDb ID ${imdbId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to retrieve the movie by IMDb ID ${imdbId}:`, error);
    return null;
  }
}

export async function searchMovies(query: string, apiKey: string): Promise<MovieSearchResult[]> {
  const data = await requestTMDB('https://api.themoviedb.org/3/search/movie', {
    api_key: apiKey,
    query,
  });
  const searchResults = data.results as any[];
  return searchResults
    .map((result) => {
      try {
        return movieSearchResultSerializer.deserialize({
          id: result.id,
          posterPath: result.poster_path,
          isAdult: result.adult,
          overview: result.overview,
          releasedOn: result.release_date,
          originalTitle: result.original_title,
          title: result.title,
          backdropPath: result.backdrop_path,
          popularity: result.popularity,
          voteCount: result.vote_count,
          voteAverage: result.vote_average,
        });
      } catch {
        return null;
      }
    })
    .filter(isNotNully);
}
