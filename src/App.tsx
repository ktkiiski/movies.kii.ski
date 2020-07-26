import { Typography } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';
import { HttpStatus } from 'broilerkit/http';
import { useCss, useTitle } from 'broilerkit/react/meta';
import { renderRoute, renderStaticRoute } from 'broilerkit/react/router';
import * as React from 'react';
import { Switch } from 'react-router-dom';
import Home from './components/Home';
import Root from './components/layout/Root';
import PollView from './components/PollView';
import RatingListView from './components/RatingListView';
import { home, listRatings, showPoll } from './routes';
import { mainTheme } from './themes';

const NotFound = () => {
  useTitle(`Page not found`);
  return (
    <Root>
      <Typography>Page not found</Typography>
    </Root>
  );
};

const App = React.memo(() => {
  const sheets = typeof window === 'undefined' ? new ServerStyleSheets() : null;
  const core = (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <Switch>
        {renderRoute(home, Home, NotFound)}
        {renderRoute(listRatings, RatingListView, NotFound)}
        {renderRoute(showPoll, PollView, NotFound)}
        {renderStaticRoute(NotFound, HttpStatus.NotFound)}
      </Switch>
    </ThemeProvider>
  );
  const app = sheets ? sheets.collect(core) : core;

  useCss(() =>
    // On server-side, render the stylesheets manually.
    // On client-side on the other hand, render nothing, as this will be handled by JSS
    sheets ? sheets.toString() : null,
  );

  return app;
});

App.displayName = 'App';

export default App;
