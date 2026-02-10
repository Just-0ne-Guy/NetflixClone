"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";
import Plans from "@/components/Plans";

async function checkIsSubscribed(uid: string) {
  // Stripe extension writes subscriptions here:
  // customers/{uid}/subscriptions/{subId}
  const subsSnap = await getDocs(collection(db, "customers", uid, "subscriptions"));

  if (subsSnap.empty) return false;

  return subsSnap.docs.some((d) => {
    const data = d.data() as any;
    return data?.status === "active" || data?.status === "trialing";
  });
}

export default function PlansLoader() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // wait for auth to resolve
        if (authLoading) return;

        // if no user, keep them here (or redirect to /login if you have one)
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        // 1) gate: if subscribed -> go home
        const subscribed = await checkIsSubscribed(user.uid);
        if (subscribed) {
          router.replace("/");
          return;
        }

        // 2) not subscribed -> load plans
        const prodSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true))
        );

        const result = await Promise.all(
          prodSnap.docs.map(async (d) => {
            const pricesSnap = await getDocs(
              query(
                collection(db, "products", d.id, "prices"),
                where("active", "==", true)
              )
            );

            const prices = pricesSnap.docs.map((p) => ({ id: p.id, ...p.data() }));
            return { id: d.id, ...d.data(), prices };
          })
        );

        if (mounted) setProducts(result);
      } catch (e) {
        console.error("plans loader failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user?.uid, router]);

  if (authLoading || loading) return <div className="p-6">loading...</div>;

  return <Plans products={products} />;
}
