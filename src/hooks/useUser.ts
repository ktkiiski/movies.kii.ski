import { User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function useUser(): User | null | undefined {
  const [user] = useAuthState(auth);
  return user;
}
