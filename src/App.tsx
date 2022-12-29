import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/Home';
import NotFoundView from './components/NotFoundView';
import PollView from './components/PollView';
import RatingListView from './components/RatingListView';
import SignInDialogProvider from './components/SignInDialogProvider';
import { mainTheme } from './themes';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'poll/:pollId',
    element: <PollView />,
  },
  {
    path: 'ratings',
    element: <RatingListView />,
  },
  {
    path: '*',
    element: <NotFoundView />,
  },
]);

const App = React.memo(() => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <SignInDialogProvider>
        <RouterProvider router={router} />
      </SignInDialogProvider>
    </ThemeProvider>
  </QueryClientProvider>
));

App.displayName = 'App';

export default App;
