import Typography from '@mui/material/Typography';
import useTitle from '../hooks/useTitle';
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
