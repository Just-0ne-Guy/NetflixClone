"use client";

import { onCurrentUserSubscriptionUpdate, Subscription } from "@stripe/firestore-stripe-payments";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import payments from "@/lib/stripe";

export default function useSubscription(user: User | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(!!user);

  useEffect(() => {
    // if logged out
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = onCurrentUserSubscriptionUpdate(payments, (snapshot) => {
      const active =
        snapshot.subscriptions.find(
          (s) => s.status === "active" || s.status === "trialing"
        ) ?? null;

      setSubscription(active);
      setLoading(false);
    });

    return () => {
      // onCurrentUserSubscriptionUpdate returns an unsubscribe function
      try {
        unsub?.();
      } catch {}
    };
  }, [user?.uid]);

  return { subscription, loading };
}
