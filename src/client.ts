import {initApi} from 'broilerkit/api';
import {AuthClient} from 'broilerkit/auth';
import * as _api from './api';

export const authClient = new AuthClient(__AUTH_OPTIONS__);
export const api = initApi(__API_ROOT__, _api, authClient);
