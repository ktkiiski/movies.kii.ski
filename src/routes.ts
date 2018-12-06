import { id } from 'broilerkit/fields';
import { route } from 'broilerkit/routes';
import { serializer } from 'broilerkit/serializers';
import { pattern } from 'broilerkit/url';

export const home = route(pattern `/`);
export const showPoll = route(pattern `/polls/${'pollId'}`, serializer({
    pollId: id(),
}));
