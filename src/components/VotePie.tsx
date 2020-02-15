import * as React from 'react';
import { Rating, Vote } from '../resources';
import VoteCountPie from './VoteCountPie';

interface VotePieProps {
  size: number;
  votes: Vote[];
  maxCount: number;
  ratings: Rating[];
  children?: React.ReactNode;
  animate: boolean;
}

function VotePie({ votes, ...props }: VotePieProps) {
  return <VoteCountPie
    positiveVoteCount={votes.filter(({ value }) => value === 1).length}
    neutralVoteCount={votes.filter(({ value }) => value === 0).length}
    negativeVoteCount={votes.filter(({ value }) => value === -1).length}
    {...props}
  />;
}

export default VotePie;
