import order from 'immuton/order';
import sort from 'immuton/sort';
import { useMemo } from 'react';
import usePollCandidates from './hooks/usePollCandidates';
import usePollParticipants from './hooks/usePollParticipants';
import usePollRatings from './hooks/usePollRatings';
import usePollVotes from './hooks/usePollVotes';
import useUserId from './hooks/useUserId';
import type { Vote, Candidate } from './resources';

export function getMovieScore(movieId: number, votes: Vote[], participantIds: string[]): number {
  const totalValue = votes.reduce((sum, vote) => sum + (vote.movieId === movieId ? vote.value : 0), 0);
  const participantCount = participantIds.length;
  const minScore = -participantCount;
  const maxScore = participantCount;
  return (100 * (totalValue - minScore)) / (maxScore - minScore);
}

export function useSortedCandidates(pollId: string, sorting: 'unvoted' | 'top'): Candidate[] {
  const userId = useUserId();
  const [candidates, isCandidatesLoading] = usePollCandidates(pollId);
  const [votes, isVotesLoading] = usePollVotes(pollId);
  const [ratings, isRatingsLoading] = usePollRatings(pollId);
  const [participants] = usePollParticipants(pollId);
  const isLoading = isCandidatesLoading || isVotesLoading || isRatingsLoading;
  // NOTE: Only the latest votes affect the ordering!
  // Therefore intentionally cache them until poll ID or sorting changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cachedVotes = useMemo(() => votes, [pollId, sorting, isLoading]);
  return useMemo(() => {
    if (!candidates || !cachedVotes || !participants) {
      return [];
    }
    const participantIds = participants.map(({ profileId }) => profileId);
    // Calculate score for each movie
    const candidateScorings = candidates.map((candidate) => ({
      candidate,
      score: getMovieScore(candidate.movieId, cachedVotes, participantIds),
      ratingCount: ratings ? ratings.filter((rating) => rating.movieId === candidate.movieId).length : 0,
      hasVoted: cachedVotes.some((vote) => vote.profileId === userId && vote.movieId === candidate.movieId),
    }));
    // Sort candidates accordingly
    const sortedScorings =
      sorting === 'top' && ratings
        ? // Sort top scored first, secondarily ordered by the rating count
          order(order(candidateScorings, 'ratingCount', 'asc'), 'score', 'desc')
        : // Sort unvoted first, secondariy last added first
          sort(
            sort(candidateScorings, ({ candidate }) => candidate.createdAt, 'desc'),
            (candidate) => (candidate.hasVoted ? 1 : 0),
          );
    // Return just the candidates
    return sortedScorings.map(({ candidate }) => candidate);
  }, [candidates, cachedVotes, participants, ratings, userId, sorting]);
}
