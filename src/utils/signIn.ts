import { User, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

function isSafari() {
  return navigator.userAgent.toLowerCase().includes('safari/');
}

export default async function signIn(provider: 'Facebook' | 'Google'): Promise<User> {
  const authProvider = provider === 'Facebook' ? facebookProvider : googleProvider;
  // Redirect login does not work in Safari: https://github.com/firebase/firebase-js-sdk/issues/6716
  const promise = isSafari() ? signInWithPopup(auth, authProvider) : signInWithRedirect(auth, authProvider);
  const credentials = await promise;
  const user = credentials?.user;
  if (!user) {
    throw new Error(`Login with ${provider} failed`);
  }
  return user;
}
