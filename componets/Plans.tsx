"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import useAuth from "../hooks/useAuth";
import useSubscription from "../hooks/useSubscription";
import Loader from "./Loader";
import { app } from "../firebase";
import { loadCheckout } from "../lib/stripe";

type Price = {
  id: string;
  unit_amount: number;
  currency: string;
  interval?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  metadata?: Record<string, string>;
  prices: Price[];
};

export default function Plans() {
  const { user, loading, logout } = useAuth();
  const { subscription, loading: subLoading } = useSubscription(user);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setProductsLoading(true);
        const db = getFirestore(app);

        const productsSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true)),
        );

        const fetched: Product[] = [];

        for (const doc of productsSnap.docs) {
          const data = doc.data() as any;

          const pricesSnap = await getDocs(
            collection(db, "products", doc.id, "prices"),
          );
          const prices: Price[] = pricesSnap.docs
            .map((p) => {
              const pd = p.data() as any;
              return {
                id: p.id,
                unit_amount: pd.unit_amount ?? 0,
                currency: pd.currency ?? "usd",
                interval: pd.interval,
              };
            })
            .sort((a, b) => a.unit_amount - b.unit_amount);

          fetched.push({
            id: doc.id,
            name: data.name ?? "Plan",
            description: data.description ?? "",
            metadata: data.metadata ?? {},
            prices,
          });
        }

        // pick cheapest price by default
        fetched.sort(
          (a, b) =>
            (a.prices?.[0]?.unit_amount ?? 0) -
            (b.prices?.[0]?.unit_amount ?? 0),
        );
        setProducts(fetched);

        if (!selectedPriceId) {
          const first = fetched?.[0]?.prices?.[0]?.id;
          if (first) setSelectedPriceId(first);
        }
      } catch (e) {
        console.error("plans fetch error:", e);
      } finally {
        setProductsLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => {
    for (const p of products) {
      const price = p.prices.find((x) => x.id === selectedPriceId);
      if (price) return { product: p, price };
    }
    return null;
  }, [products, selectedPriceId]);

  const prettyPrice = (amount: number, currency: string) => {
    const dollars = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(dollars);
  };

  const subscribe = async () => {
    if (!selected?.price?.id) return;
    try {
      setCheckoutLoading(true);
      await loadCheckout(selected.price.id);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading || subLoading) return <Loader />;
  if (!user) return <Loader />;
  if (checkoutLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <Image
          src="https://rb.gy/ulxxee"
          alt="Netflix"
          width={140}
          height={40}
          className="cursor-pointer object-contain"
        />
        <button
          onClick={logout}
          className="text-sm font-medium hover:underline"
        >
          Sign Out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16">
        <h1 className="mt-6 text-3xl font-semibold">choose your plan</h1>
        <p className="mt-2 text-sm text-neutral-300">
          pick the plan that’s right for you. you can change or cancel anytime
        </p>

        {productsLoading ? (
          <div className="mt-10">
            <Loader />
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {products.map((p) => {
                const price = p.prices?.[0];
                if (!price) return null;

                const isActive = selectedPriceId === price.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPriceId(price.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      isActive
                        ? "border-[#E50914] bg-neutral-900"
                        : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900"
                    }`}
                  >
                    <div className="text-lg font-semibold">{p.name}</div>
                    <div className="mt-1 text-sm text-neutral-300">
                      {prettyPrice(price.unit_amount, price.currency)}
                      {price.interval ? ` / ${price.interval}` : ""}
                    </div>

                    {!!p.metadata && (
                      <div className="mt-4 space-y-1 text-xs text-neutral-300">
                        {p.metadata.quality && (
                          <div>quality: {p.metadata.quality}</div>
                        )}
                        {p.metadata.resolution && (
                          <div>resolution: {p.metadata.resolution}</div>
                        )}
                        {p.metadata.streams && (
                          <div>streams: {p.metadata.streams}</div>
                        )}
                        {p.metadata.downloads && (
                          <div>downloads: {p.metadata.downloads}</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={subscribe}
              disabled={!selectedPriceId}
              className="mt-10 w-full rounded bg-[#E50914] py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            >
              {subscription ? "manage subscription" : "start membership"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
