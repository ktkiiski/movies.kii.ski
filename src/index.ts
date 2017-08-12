import './index.scss';

// Write your code here!

import imageUrl = require('./images/broilerplate.png');
// tslint:disable:no-console
console.log(`Web site origin: ${__SITE_ORIGIN__}`);
console.log(`Static assets origin: ${__ASSETS_ORIGIN__}`);
console.log(`Commit: ${__COMMIT_HASH__}`);
console.log(`Version: ${__VERSION__}`);
console.log(`Branch: ${__BRANCH__}`);
console.log(`Example image URL: ${imageUrl}`);
// tslint:enable:no-console
