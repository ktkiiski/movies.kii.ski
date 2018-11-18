import { id } from 'broilerkit/fields';
import { Location } from 'broilerkit/location';
import { route } from 'broilerkit/routes';
import { Router } from 'broilerkit/routing';
import { serializer } from 'broilerkit/serializers';
import { pattern } from 'broilerkit/url';

const location = new Location();

export const router = new Router(location, {
    home: route(pattern `/`),
    showPoll: route(pattern `/polls/${'pollId'}`, serializer({
        pollId: id(),
    })),
});
