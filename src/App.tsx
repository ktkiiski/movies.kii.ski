import CssBaseline from '@material-ui/core/CssBaseline';
import { ServerStyleSheets, ThemeProvider } from '@material-ui/styles';
import { HttpStatus } from 'broilerkit/http';
import { useCss } from 'broilerkit/react/meta';
import { renderRoute, renderStaticRoute } from 'broilerkit/react/router';
import * as React from 'react';
import { Switch } from 'react-router-dom';
import Home from './components/Home';
import NotFoundView from './components/NotFoundView';
import PollView from './components/PollView';
import RatingListView from './components/RatingListView';
import SignInDialogProvider from './components/SignInDialogProvider';
import { home, listRatings, showPoll } from './routes';
import { mainTheme } from './themes';

const App = React.memo(() => {
  const sheets = typeof window === 'undefined' ? new ServerStyleSheets() : null;
  const core = (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <SignInDialogProvider>
        <Switch>
          {renderRoute(home, Home, NotFoundView)}
          {renderRoute(listRatings, RatingListView, NotFoundView)}
          {renderRoute(showPoll, PollView, NotFoundView)}
          {renderStaticRoute(NotFoundView, HttpStatus.NotFound)}
        </Switch>
      </SignInDialogProvider>
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
