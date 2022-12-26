import { User } from 'firebase/auth';
import { useCallback } from 'react';
import { useSignInWithFacebook, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function useSignIn(): [(provider: 'Facebook' | 'Google') => Promise<User>, boolean] {
  const [signInWithFacebook, , isSigningInWithFacebook] = useSignInWithFacebook(auth);
  const [signInWithGoogle, , isSigningInWithGoogle] = useSignInWithGoogle(auth);
  const signIn = useCallback(
    async (provider: 'Facebook' | 'Google') => {
      const promise = provider === 'Facebook' ? signInWithFacebook() : signInWithGoogle();
      const credentials = await promise;
      const user = credentials?.user;
      if (!user) {
        throw new Error(`Login with ${provider} failed`);
      }
      return user;
    },
    [signInWithFacebook, signInWithGoogle],
  );
  return [signIn, isSigningInWithFacebook || isSigningInWithGoogle];
}
