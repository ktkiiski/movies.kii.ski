import { ApiService } from 'broilerkit/server';
import * as examples from './examples/server';

/**
 * Create an API server instance using the
 * implemented API endpoint functions.
 */
export = new ApiService({...examples});
