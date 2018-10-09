import { green, red, yellow } from '@material-ui/core/colors';
import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Rating, Vote } from '../resources';
import Center from './Center';
import Stack from './Stack';

interface VotePieProps {
    size: number;
    votes: Vote[];
    maxCount: number;
    ratings: Rating[];
    children?: React.ReactNode;
}

function VotePie({size, votes, maxCount, ratings, children}: VotePieProps) {
    const data = [{
        name: '+1',
        value: votes.filter(({value}) => value === 1).length,
        color: green[400],
    }, {
        name: '±0',
        value: votes.filter(({value}) => value === 0).length,
        color: yellow[400],
    }, {
        name: '-1',
        value: votes.filter(({value}) => value === -1).length,
        color: red[400],
    }, {
        name: 'Not voted',
        value: Math.max(maxCount - votes.length, 0),
        color: 'rgba(128,128,128,0.3)',
    }];
    const ratingsData = [{
        name: 'Seen',
        value: ratings.length,
        color: 'rgba(128,80,80,0.7)',
    }, {
        name: 'Not seen',
        value: maxCount - ratings.length,
        color: 'rgba(0,0,0,0)',
    }];
    return <Stack>
        <PieChart width={size} height={size}>
            <Pie innerRadius={size * 0.37} outerRadius={size * 0.4} data={ratingsData} dataKey={'value'} stroke={0} animationBegin={0} animationDuration={700}>
                {ratingsData.map(({name, color}) => <Cell fill={color} key={name} />)}
            </Pie>
            <Pie innerRadius={size * 0.4} outerRadius={size * 0.5} data={data} dataKey={'value'} stroke={0} animationBegin={0} animationDuration={700}>
                {data.map(({name, color}) => <Cell fill={color} key={name} />)}
            </Pie>
        </PieChart>
        {children && <Center>{children}</Center>}
    </Stack>;
}

export default VotePie;
