import { createGenerateClassName, MuiThemeProvider, Typography } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useCss, useTitle } from 'broilerkit/react/meta';
import { renderRoute } from 'broilerkit/react/router';
import * as React from 'react';
import { useMemo } from 'react';
import { JssProvider, SheetsRegistry } from 'react-jss';
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import Root from './components/layout/Root';
import PollView from './components/PollView';
import { home, showPoll } from './routes';
import { mainTheme } from './themes';

const NotFound = () => {
    useTitle(`Page not found`);
    return <Root>
        <Typography>Page not found</Typography>
    </Root>;
};

export default () => {
    const generateClassName = useMemo(createGenerateClassName, []);
    const sheetsRegistry = useMemo(() => new SheetsRegistry(), []);
    useCss(() => (
        // On server-side, render the stylesheets manually.
        // On client-side on the other hand, render nothing, as this will be handled by JSS
        typeof window === 'undefined' ? sheetsRegistry.toString() : null
    ));
    return (
        <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
            <MuiThemeProvider theme={mainTheme} sheetsManager={new Map()}>
                <CssBaseline />
                <Switch>
                    {renderRoute(home, Home, NotFound)}
                    {renderRoute(showPoll, PollView, NotFound)}
                    <Route component={NotFound} />
                </Switch>
            </MuiThemeProvider>
        </JssProvider>
    );
};
