import 'rxjs';
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

async function main() {
    const example = await createExample.post({
        name: 'John Doe',
        age: 31,
        isFine: true,
    }).toPromise();
    console.log(`Created example:`, example);
    const {id} = example;
    console.log(`Retrieved an example:`, await retrieveExample.get({id}).toPromise());
    console.log(`Listed examples:`, await listExamples.list({
        ordering: 'createdAt',
        direction: 'asc',
    }).toArray().toPromise());
    console.log(`Updated example:`, await updateExample.put({
        id,
        name: 'John Doe',
        age: 32,
        isFine: false,
    }).toPromise());
    await destroyExample.delete({id});
    console.log(`Deleted example!`);
}
// tslint:enable:no-console
main();
