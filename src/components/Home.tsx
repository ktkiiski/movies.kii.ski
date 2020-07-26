import Typography from '@material-ui/core/Typography';
import { useTitle } from 'broilerkit/react/meta';
import * as React from 'react';
import Layout from './Layout';
import Center from './layout/Center';

export default function Home() {
  useTitle(`Movie polls`);
  return (
    <Layout title="Movie Polls">
      <Center>
        <Typography variant="h1">Welcome!</Typography>
        <Typography>Start by opening the menu!</Typography>
      </Center>
    </Layout>
  );
}
