export interface Movie {
  id: number;
  createdAt: number;
  updatedAt: number;
  type: 'movie' | 'series';
  imdbId: string | null;
  title: string | null;
  originalTitle: string | null;
  tagline: string | null;
  overview: string | null;
  homePageUrl: string | null;

  releasedOn: string | null;
  popularity: number | null;
  runtime: number | null;
  budget: number | null;
  revenue: number | null;
  voteAverage: number | null;
  voteCount: number | null;
  isAdult: boolean | null;

  posterPath: string | null;
  backdropPath: string | null;

  genres: string[];
  languages: string[];
}

export interface MovieSearchResult {
  id: number;
  posterPath: string | null;
  isAdult: boolean | null;
  overview: string | null;
  releasedOn: string | null;
  originalTitle: string | null;
  title: string | null;
  backdropPath: string | null;
  popularity: number | null;
  voteAverage: number | null;
  voteCount: number | null;
}
