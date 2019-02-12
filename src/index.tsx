import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import { AuthClient } from 'broilerkit/auth';
import { Client } from 'broilerkit/client';
import { ClientProvider } from 'broilerkit/react/client';

// tslint:disable:no-console
console.log(`Web site root URL: ${__SITE_ROOT__}`);
console.log(`Static assets root URL: ${__ASSETS_ROOT__}`);
console.log(`API root URL: ${__API_ROOT__}`);
console.log(`Commit: ${__COMMIT_HASH__}`);
console.log(`Version: ${__VERSION__}`);
console.log(`Branch: ${__BRANCH__}`);

const authClient = new AuthClient(__AUTH_OPTIONS__);
const client = new Client(__API_ROOT__, authClient);

authClient.observe().subscribe((auth) => {
    if (auth) {
        console.log(`User is logged in:`, auth);
    } else {
        console.log(`User is not logged in`);
    }
});

ReactDOM.render(
    <ClientProvider client={client}>
        <App />,
    </ClientProvider>,
    document.getElementById('app'),
);
