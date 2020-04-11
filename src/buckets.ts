import { bucket } from 'broilerkit/buckets';

/**
 * Bucket where users will upload their IMDb rating files.
 */
export const ratingsBucket = bucket('ratings', {
  access: 'private',
});
