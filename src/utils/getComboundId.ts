export default function getComboundId(...keys: string[]): string {
  return keys.join(':');
}
