import { datetime, integer, nullable, string } from 'broilerkit/fields';
import { Encoding, serializer } from 'broilerkit/serializers';
import * as parseCSV from 'csv-parse/lib/sync';

const fieldTransforms: Record<string, string> = {
  'id': 'id',
  'const': 'id',
  'title': 'title',
  'created': 'created',
  'modified': 'modified',
  'you rated': 'value',
  'your_rating': 'value',
  'date rated': 'created',
};

const imdbRatingSerializer = serializer({
  id: string(), // Example: '99'
  title: string(), // Example: 'Synecdoche, New York'
  created: datetime(), // Example: 'Thu Jul  1 00:00:00 2010'
  modified: nullable(datetime()), // Example: ''
  value: integer(), // Example: '9'
}).defaults({
  modified: null,
});

export function parseImdbRatingsCsv(data: string) {
  const items: Encoding[] = parseCSV(data, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  return items.map((item) => {
    const entry: Encoding = {};
    Object.keys(item).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const newKey = fieldTransforms[lowerKey] || lowerKey;
      entry[newKey] = item[key];
    });
    return imdbRatingSerializer.decode(entry);
  });
}
