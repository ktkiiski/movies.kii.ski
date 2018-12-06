import { MuiThemeProvider, Typography } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { renderRoute } from 'broilerkit/react/router';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import PollView from './components/PollView';
import { home, showPoll } from './routes';
import { mainTheme } from './themes';

const NotFound = () => <Typography>Page not found</Typography>;

const App = () => (
    <MuiThemeProvider theme={mainTheme}>
        <CssBaseline />
        <BrowserRouter>
            <Switch>
                {renderRoute(home, Home, NotFound)}
                {renderRoute(showPoll, PollView, NotFound)}
                <Route component={NotFound} />
            </Switch>
        </BrowserRouter>
    </MuiThemeProvider>
);

export default App;
