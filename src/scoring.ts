import { useList } from 'broilerkit/react/api';
import { useUserId } from 'broilerkit/react/auth';
import order from 'immuton/order';
import sort from 'immuton/sort';
import { useMemo } from 'react';
import * as api from './api';
import type { Vote, DetailedCandidate } from './resources';

export function getMovieScore(movieId: number, votes: Vote[], participantIds: string[]): number {
  const totalValue = votes.reduce((sum, vote) => sum + (vote.movieId === movieId ? vote.value : 0), 0);
  const participantCount = participantIds.length;
  const minScore = -participantCount;
  const maxScore = participantCount;
  return (100 * (totalValue - minScore)) / (maxScore - minScore);
}

export function useSortedCandidates(pollId: string, sorting: 'unvoted' | 'top'): DetailedCandidate[] {
  const userId = useUserId();
  const [candidates, , isCandidatesLoading] = useList(api.listPollCandidates, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const [votes, , isVotesLoading] = useList(api.listPollVotes, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const [ratings, , isRatingsLoading] = useList(api.listPollRatings, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const [participants] = useList(api.listPollParticipants, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
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
