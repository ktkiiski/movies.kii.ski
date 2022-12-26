import { FirestoreError, Query, queryEqual, onSnapshot } from 'firebase/firestore';
import { empty } from 'immuton';
import { useEffect, useReducer, useRef } from 'react';

interface Subscription<T> {
  query: Query<T>;
  unsubscribe: () => void;
  data: T[] | null;
  error: FirestoreError | null;
}

function subscribeQuery<T>(query: Query<T>, trigger: () => void): Subscription<T> {
  const subscription: Partial<Subscription<T>> = {
    query,
    data: null,
    error: null,
  };
  subscription.unsubscribe = onSnapshot(
    query,
    (snapshot) => {
      subscription.data = snapshot.docs.map((doc) => doc.data());
      subscription.error = null;
      trigger();
    },
    (error) => {
      subscription.data = empty;
      subscription.error = error;
      trigger();
    },
  );
  return subscription as Subscription<T>;
}

function increment(count: number) {
  return count + 1;
}

export default function useMultipleQueries<T>(queries: Query<T>[]): [T[], boolean, FirestoreError | undefined] {
  const [, refresh] = useReducer(increment, 0);
  const subscriptionsRef = useRef<Subscription<T>[]>([]);
  useEffect(() => {
    const subscriptions = subscriptionsRef.current;
    for (let index = subscriptions.length - 1; index >= 0; index -= 1) {
      const subscription = subscriptions[index];
      if (!queries.some((query) => queryEqual(query, subscription.query))) {
        // This query should no longer be subscribed!
        subscription.unsubscribe();
        subscriptions.splice(index, 1);
        refresh();
      }
    }
    queries.forEach((query) => {
      if (!subscriptions.some((sub) => queryEqual(sub.query, query))) {
        // This query is not yet subscribed!
        const subscription = subscribeQuery(query, refresh);
        subscriptions.push(subscription);
      }
    });
  });
  const subscriptions = subscriptionsRef.current;
  const isLoading = subscriptions.some((sub) => sub.data == null);
  const error = subscriptions.find((sub) => sub.error)?.error ?? undefined;
  const allData = subscriptionsRef.current.every((sub) => sub.data != null)
    ? subscriptionsRef.current.flatMap((sub) => sub.data!)
    : empty;
  return [allData, isLoading, error];
}
