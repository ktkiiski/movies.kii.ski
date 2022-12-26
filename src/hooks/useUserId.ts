import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

export default function useUserId(): string | null | undefined {
  const [user] = useAuthState(auth);
  return user ? user.uid : user;
}
