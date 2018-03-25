import { ApiService } from 'broilerkit/server';
import * as pollsDB from './polls/db';
import * as pollServer from './polls/server';

/**
 * Create an API server instance using the
 * implemented API endpoint functions.
 */
export = new ApiService({...pollServer}, {...pollsDB});
