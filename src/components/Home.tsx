import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import Center from './Center';
import Layout from './Layout';

class Home extends React.Component<{}, {}> {
    public render() {
        return <Layout title='Movie Polls'>
            <Center>
                <Typography variant='display1'>Welcome!</Typography>
                <Typography>Start by opening the menu!</Typography>
            </Center>
        </Layout>;
    }
}

export default Home;
