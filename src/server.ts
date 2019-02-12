import { ApiService } from 'broilerkit/server';
import * as db from './db';
import endpoints from './endpoints';

/**
 * Create an API server instance using the
 * implemented API endpoint functions.
 */
export = new ApiService(endpoints, db);
