import * as React from 'react';
import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
}

function ClientOnly({ children }: ClientOnlyProps) {
  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    setIsRendered(true);
  }, []);
  return isRendered ? <>{children}</> : null;
}

export default ClientOnly;
