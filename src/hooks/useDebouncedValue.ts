import { useEffect, useState } from 'react';

export default function useDebouncedValue<T>(input: T, delay: number): T {
  const [output, setOutput] = useState(input);
  useEffect(() => {
    const timeout = setTimeout(() => setOutput(input), delay);
    return () => clearTimeout(timeout);
  }, [input, delay]);
  return output;
}
