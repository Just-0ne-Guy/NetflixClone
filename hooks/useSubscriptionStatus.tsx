"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

type SubDoc = {
  status?: string; // "active" | "trialing" | "canceled" | etc
  created?: any;
  current_period_end?: any;
};

export default function useSubscriptionStatus(user: User | null) {
  const [loading, setLoading] = useState<boolean>(!!user);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const subsRef = collection(db, "customers", user.uid, "subscriptions");

    const unsub = onSnapshot(
      subsRef,
      (snap) => {
        // no docs = no subscription
        if (snap.empty) {
          setIsSubscribed(false);
          setLoading(false);
          return;
        }

        // find any active/trialing sub
        const hasActive = snap.docs.some((d) => {
          const data = d.data() as SubDoc;
          return data?.status === "active" || data?.status === "trialing";
        });

        setIsSubscribed(hasActive);
        setLoading(false);
      },
      (err) => {
        console.error("subscription snapshot error:", err);
        setIsSubscribed(false);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  return { isSubscribed, loading };
}
