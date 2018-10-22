import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import Layout from './Layout';
import Center from './layout/Center';

class Home extends React.Component<{}, {}> {
    public render() {
        return <Layout title='Movie Polls'>
            <Center>
                <Typography variant='h1'>Welcome!</Typography>
                <Typography>Start by opening the menu!</Typography>
            </Center>
        </Layout>;
    }
}

export default Home;
