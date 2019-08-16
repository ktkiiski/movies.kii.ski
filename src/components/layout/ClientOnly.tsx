import * as React from 'react';
import { useLayoutEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

function ClientOnly({ children }: ClientOnlyProps) {
  const [isRendered, setIsRendered] = useState(false);
  useLayoutEffect(() => {
    setIsRendered(true);
  }, []);
  return isRendered ? <>{children}</> : null;
}

export default ClientOnly;
