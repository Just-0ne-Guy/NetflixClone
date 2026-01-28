"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  collection,
  getFirestore,
  limit,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import app from "../firebase";

type ActiveSub = {
  id: string;
  status?: string;
  role?: string;
  current_period_end?: any;
  current_period_start?: any;
  [key: string]: any;
};

/**
 * returns:
 * - null while loading
 * - undefined if no active subscription
 * - subscription object if active
 */
export default function useSubscription(user: User | null | undefined) {
  const [subscription, setSubscription] = useState<ActiveSub | null | undefined>(
    null
  );

  useEffect(() => {
    setSubscription(null);

    if (!user?.uid) {
      setSubscription(undefined);
      return;
    }

    const db = getFirestore(app);

    const q = query(
      collection(db, "customers", user.uid, "subscriptions"),
      where("status", "in", ["trialing", "active"]),
      limit(1)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setSubscription(undefined);
          return;
        }

        const docSnap = snap.docs[0];
        setSubscription({ id: docSnap.id, ...docSnap.data() } as ActiveSub);
      },
      () => {
        setSubscription(undefined);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  return subscription;
}
