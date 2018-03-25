import {init} from 'broilerkit/api';
import * as pollsApi from './polls/api';

import './index.scss';

// Write your code here!

import imageUrl = require('./images/broilerplate.png');
// tslint:disable:no-console
console.log(`Web site root URL: ${__SITE_ROOT__}`);
console.log(`Static assets root URL: ${__ASSETS_ROOT__}`);
console.log(`API root URL: ${__API_ROOT__}`);
console.log(`Commit: ${__COMMIT_HASH__}`);
console.log(`Version: ${__VERSION__}`);
console.log(`Branch: ${__BRANCH__}`);
console.log(`Example image URL: ${imageUrl}`);

init(__API_ROOT__, pollsApi, async ({pollCollection, pollResource}) => {
    // Create an example poll resource
    let poll = await pollCollection.post({
        title: 'Example Poll',
        description: 'A temporary example poll',
        websiteUrl: 'https://kii.ski',
        urlKey: Math.random().toString(36).substr(2, 5),
    });
    console.log(`Created a new poll:`, poll);
    // Retrieve the created poll
    const {id} = poll;
    console.log(`Retrieved the poll:`, await pollResource.get({id}));
    // Update the poll
    poll = await pollResource.patch({
        id, description: 'A temporary example poll for demo purposes',
    });
    console.log(`Updated the poll:`, poll);
    // List all the existing polls
    console.log(`Listed polls:`, await pollCollection.getAll({
        ordering: 'createdAt',
        direction: 'asc',
    }));
    // Destroy the example poll
    await pollResource.delete({id});
    console.log(`Deleted example!`);
});
// tslint:enable:no-console
