import { green, red, yellow } from '@material-ui/core/colors';
import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import type { Rating } from '../resources';
import Center from './layout/Center';
import ClientOnly from './layout/ClientOnly';
import Stack from './layout/Stack';

interface VoteCountPieProps {
  size: number;
  positiveVoteCount: number;
  neutralVoteCount: number;
  negativeVoteCount: number;
  maxCount: number;
  ratings: Rating[];
  children?: React.ReactNode;
  animate: boolean;
}

function VoteCountPie(props: VoteCountPieProps) {
  const { size, maxCount, ratings, children, animate, positiveVoteCount, neutralVoteCount, negativeVoteCount } = props;
  const voteCount = positiveVoteCount + neutralVoteCount + negativeVoteCount;
  const data = [
    {
      name: '+1',
      value: positiveVoteCount,
      color: green[400],
    },
    {
      name: '±0',
      value: neutralVoteCount,
      color: yellow[600],
    },
    {
      name: '-1',
      value: negativeVoteCount,
      color: red[400],
    },
    {
      name: 'Not voted',
      value: Math.max(maxCount - voteCount, 0),
      color: 'rgba(128,128,128,0.3)',
    },
  ];
  const ratingsData = [
    {
      name: 'Seen',
      value: ratings.length,
      color: 'rgba(200,150,150,0.7)',
    },
    {
      name: 'Not seen',
      value: maxCount - ratings.length,
      color: 'rgba(0,0,0,0)',
    },
  ];
  return (
    <Stack style={{ width: `${size}px`, height: `${size}px` }}>
      <ClientOnly>
        <PieChart width={size} height={size}>
          <Pie
            innerRadius={size * 0.32}
            outerRadius={size * 0.4}
            data={ratingsData}
            dataKey="value"
            animationBegin={0}
            animationDuration={700}
            isAnimationActive={animate}
          >
            {ratingsData.map(({ name, color }) => (
              <Cell fill={color} key={name} />
            ))}
          </Pie>
          <Pie
            innerRadius={size * 0.4}
            outerRadius={size * 0.5}
            data={data}
            dataKey="value"
            animationBegin={0}
            animationDuration={700}
            isAnimationActive={animate}
          >
            {data.map(({ name, color }) => (
              <Cell fill={color} key={name} />
            ))}
          </Pie>
        </PieChart>
      </ClientOnly>
      {children && <Center>{children}</Center>}
    </Stack>
  );
}

export default VoteCountPie;
