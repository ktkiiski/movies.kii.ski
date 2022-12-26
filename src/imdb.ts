import parseCSV from 'csv-parse/lib/sync';
import { serializer, fields, Encoding } from 'serializers';

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
  id: fields.string(0, null, true), // Example: '99'
  title: fields.string(0, null, true), // Example: 'Synecdoche, New York'
  created: fields.datetime(), // Example: 'Thu Jul  1 00:00:00 2010'
  modified: fields.nullable(fields.datetime()), // Example: ''
  value: fields.integer(), // Example: '9'
});

// eslint-disable-next-line import/prefer-default-export
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
    return imdbRatingSerializer.decodeFields({
      modified: '',
      ...entry,
    });
  });
}
