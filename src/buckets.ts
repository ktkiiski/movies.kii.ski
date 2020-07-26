import { bucket } from 'broilerkit/buckets';

/**
 * Bucket where users will upload their IMDb rating files.
 */
// eslint-disable-next-line import/prefer-default-export
export const ratingsBucket = bucket('ratings', {
  access: 'private',
});
