import { AuthError, getRedirectResult } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';

export default function useAuthRedirectError(): AuthError | null {
  const [error, setError] = useState<AuthError | null>(null);
  useEffect(() => {
    getRedirectResult(auth).catch((authErr: AuthError) => setError(authErr));
  }, []);
  return error;
}
