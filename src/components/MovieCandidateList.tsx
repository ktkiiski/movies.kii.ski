import * as React from 'react';
import { useSortedCandidates } from '../scoring';
import MovieCandidate from './MovieCandidate';

interface MovieCandidateListProps {
  pollId: string;
  sorting: 'unvoted' | 'top';
}

function MovieCandidateList({ pollId, sorting }: MovieCandidateListProps) {
  const candidates = useSortedCandidates(pollId, sorting);
  return <>{candidates.map((candidate) => (
    <MovieCandidate key={candidate.movieId} pollId={pollId} candidate={candidate} />
  ))}</>;
}

export default React.memo(MovieCandidateList);
