import { useList } from 'broilerkit/react/api';
import { useUserId } from 'broilerkit/react/auth';
import { order, sort } from 'broilerkit/utils/arrays';
import { useMemo } from 'react';
import * as api from './api';
import { Vote } from './resources';

export function getMovieScore(movieId: number, votes: Vote[], participantIds: string[]) {
  const totalValue = votes.reduce((sum, vote) => sum + (vote.movieId === movieId ? vote.value : 0), 0);
  const participantCount = participantIds.length;
  const minScore = -participantCount;
  const maxScore = participantCount;
  return 100 * (totalValue - minScore) / (maxScore - minScore);
}

export function useSortedCandidates(pollId: string, sorting: 'unvoted' | 'top') {
  const userId = useUserId();
  const [candidates] = useList(api.listPollCandidates, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const [votes] = useList(api.listPollVotes, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const [ratings] = useList(api.listPollRatings, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  // NOTE: Only the latest votes affect the ordering!
  // Therefore intentionally cache them until poll ID or sorting changes.
  const cachedVotes = useMemo(() => votes, [pollId, sorting, votes == null]);
  const [participants] = useList(api.listPollParticipants, {
    pollId,
    ordering: 'createdAt',
    direction: 'asc',
  });
  const participantIds = participants ? participants.map(({ profileId }) => profileId) : [];
  return useMemo(
    () => {
      if (!candidates || !cachedVotes) {
        return [];
      }
      // Calculate score for each movie
      const candidateScoring = candidates.map((candidate) => ({
        candidate,
        score: getMovieScore(candidate.movieId, cachedVotes, participantIds),
        ratingCount: ratings ? ratings.filter((rating) => rating.movieId === candidate.movieId).length : 0,
        hasVoted: cachedVotes.some((vote) => (
          vote.profileId === userId && vote.movieId === candidate.movieId
        )),
      }));
      // Sort candidates accordingly
      const sortedScorings = sorting === 'top' && ratings
        // Sort top scored first, secondarily ordered by the rating count
        ? order(
          order(candidateScoring, 'ratingCount', 'asc'),
          'score', 'desc',
        )
        // Sort unvoted first, secondariy last added first
        : sort(
          sort(candidateScoring, ({ candidate }) => candidate.createdAt, 'desc'),
          (candidate) => candidate.hasVoted ? 1 : 0,
        );
      // Return just the candidates
      return sortedScorings.map(({ candidate }) => candidate);
    },
    [
      candidates,
      cachedVotes,
      participantIds,
      ratings,
      userId,
      sorting,
    ],
  );
}
