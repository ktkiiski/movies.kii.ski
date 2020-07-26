import * as React from 'react';
import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

function ClientOnly({ children }: ClientOnlyProps) {
  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    setIsRendered(true);
  }, []);
  if (!isRendered) {
    return null;
  }
  return <>{children}</>;
}

export default ClientOnly;
