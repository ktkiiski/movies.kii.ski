export default function shortenSentences(str: string, maxLength: number, replacement?: string): string {
  if (str.length <= maxLength) {
    return str;
  }
  // eslint-disable-next-line no-param-reassign
  str = str.slice(0, maxLength);
  const result = str.replace(/([.?!…]+)[^.?!…]*?$/, (_, term) => (!term ? '' : replacement || term));
  return result === str ? '' : result;
}
