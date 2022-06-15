type Search = {
    searchType: string;
    expression: string;
    results: [
      {
        id: string;
        resultType: string;
        image: string;
        title: string;
        description: string;
      }
    ];
    errorMessage: string;
  }

type Ratings = {
  imDbId: string;
  title: string;
  fullTitle: string;
  type: string;
  year: string;
  imDb: string;
  metacritic: string;
  theMovieDb: string;
  rottenTomatoes: string;
  filmAffinity: string;
  errorMessage: string
}

export type { Search, Ratings };