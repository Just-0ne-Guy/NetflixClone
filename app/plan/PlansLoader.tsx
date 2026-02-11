"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Plans from "@/components/Plans";



type Price = {
  id: string;
  unit_amount: number | null;
  currency: string;
  recurring?: {
    interval?: string;
    interval_count?: number;
  };
  metadata?: Record<string, string>;
};

type Product = {
  id: string;
  name?: string;
  active?: boolean;
  description?: string | null;
  metadata?: Record<string, string>;
  prices: Price[];
};

export default function PlansLoader() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const prodSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true))
        );

        const result = await Promise.all(
          prodSnap.docs.map(async (d) => {
            const pricesSnap = await getDocs(
              collection(db, "products", d.id, "prices")
            );

            const prices: Price[] = pricesSnap.docs.map((p) => {
              const data = p.data() as Omit<Price, "id">;
              return { id: p.id, ...data };
            });

            const productData = d.data() as Omit<Product, "id" | "prices">;
            return { id: d.id, ...productData, prices };
          })
        );

        setProducts(result);
      } catch (e) {
        console.error("direct firestore products fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-white/80">loading...</div>;

  return <Plans products={products} />;
}
