"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Plans, { type PlanProduct } from "@/components/Plans";

export default function PlansLoader() {
  const [products, setProducts] = useState<PlanProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const prodSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true)),
        );

        const result: PlanProduct[] = await Promise.all(
          prodSnap.docs.map(async (d) => {
            const pricesSnap = await getDocs(
              collection(db, "products", d.id, "prices"),
            );
            const prices = pricesSnap.docs.map((p) => ({
              id: p.id,
              ...(p.data() as Record<string, unknown>),
            }));

            return {
              id: d.id,
              ...(d.data() as Record<string, unknown>),
              prices,
            } as PlanProduct;
          }),
        );

        setProducts(result);
      } catch (e) {
        console.error("direct firestore products fetch failed:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">loading...</div>;
  return <Plans products={products as PlanProduct[]} />;
}
