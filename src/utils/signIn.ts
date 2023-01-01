import { User, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect } from 'firebase/auth';
import { auth } from '../firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

export default async function signIn(provider: 'Facebook' | 'Google'): Promise<User> {
  const authProvider = provider === 'Facebook' ? facebookProvider : googleProvider;
  const promise = signInWithRedirect(auth, authProvider);
  return promise;
  // const credentials = await promise;
  // const user = credentials?.user;
  // if (!user) {
  //   throw new Error(`Login with ${provider} failed`);
  // }
  // return user;
}
