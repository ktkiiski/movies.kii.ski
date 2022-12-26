import { FirestoreError } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import getPollRef from '../references/getPollRef';
import { Poll } from '../resources';

export default function usePoll(pollId: string): [Poll | undefined, boolean, FirestoreError | undefined] {
  const docRef = getPollRef({ id: pollId });
  const [poll, isLoading, error] = useDocumentData<Poll>(docRef);
  return [poll, isLoading, error];
}
