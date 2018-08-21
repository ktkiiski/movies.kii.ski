import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import {authClient} from './client';

// tslint:disable:no-console
console.log(`Web site root URL: ${__SITE_ROOT__}`);
console.log(`Static assets root URL: ${__ASSETS_ROOT__}`);
console.log(`API root URL: ${__API_ROOT__}`);
console.log(`Commit: ${__COMMIT_HASH__}`);
console.log(`Version: ${__VERSION__}`);
console.log(`Branch: ${__BRANCH__}`);

authClient.observe().subscribe((auth) => {
    if (auth) {
        console.log(`User is logged in:`, auth);
    } else {
        console.log(`User is not logged in`);
    }
});

ReactDOM.render(<App />, document.getElementById('app'));
