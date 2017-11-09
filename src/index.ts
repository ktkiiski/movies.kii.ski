import {createExample, destroyExample, listExamples, retrieveExample, updateExample} from './examples/api';

import './index.scss';

// Write your code here!

import imageUrl = require('./images/broilerplate.png');
// tslint:disable:no-console
console.log(`Web site origin: ${__SITE_ORIGIN__}`);
console.log(`Static assets origin: ${__ASSETS_ORIGIN__}`);
console.log(`API origin: ${__API_ORIGIN__}`);
console.log(`Commit: ${__COMMIT_HASH__}`);
console.log(`Version: ${__VERSION__}`);
console.log(`Branch: ${__BRANCH__}`);
console.log(`Example image URL: ${imageUrl}`);

retrieveExample.get({id: '1'}).subscribe((example) => {
    console.log(`Retrieved an example:`, example);
});

listExamples.list({
    ordering: 'createdAt',
    direction: 'asc',
}).toArray().subscribe((examples) => {
    console.log(`Listed examples:`, examples);
});

createExample.post({
    name: 'John Doe',
    age: 31,
    isFine: true,
}).subscribe((example) => {
    console.log(`Created example:`, example);
});

updateExample.put({
    id: '1',
    name: 'John Doe',
    age: 31,
    isFine: false,
}).subscribe((example) => {
    console.log(`Updated example:`, example);
});

destroyExample.delete({id: '1'}).subscribe({complete: () => {
    console.log(`Deleted example!`);
}});
// tslint:enable:no-console
