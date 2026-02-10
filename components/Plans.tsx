"use client";

import type { Product } from "@stripe/firestore-stripe-payments";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/outline";
import useAuth from "../hooks/useAuth";
import Loader from "./Loader";

import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

async function startCheckout(uid: string, priceId: string) {
  const colRef = collection(db, "customers", uid, "checkout_sessions");

  const docRef = await addDoc(colRef, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: `${window.location.origin}/plan`,
  });

  return new Promise<void>((resolve, reject) => {
    const unsub = onSnapshot(docRef, (snap) => {
      const data = snap.data() as any;

      if (data?.error) {
        unsub();
        reject(new Error(data.error.message ?? "stripe checkout error"));
        return;
      }

      if (data?.url) {
        unsub();
        window.location.assign(data.url);
        resolve();
      }
    });
  });
}

interface Props {
  products: Product[];
}

function safeNum(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function Plans({ products: initialProducts = [] }: Props) {
  const { logout, user } = useAuth();
  const [isBillingLoading, setBillingLoading] = useState(false);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [productsLoading, setProductsLoading] = useState(
    initialProducts.length === 0,
  );

  useEffect(() => {
    if (initialProducts.length) return;

    let cancelled = false;

    const run = async () => {
      setProductsLoading(true);
      try {
        const { getDocs, orderBy, query, where } =
          await import("firebase/firestore");

        // get active products
        const productsSnap = await getDocs(
          query(collection(db, "products"), where("active", "==", true)),
        );

        const items: any[] = [];

        for (const p of productsSnap.docs) {
          // get active prices for each product
          const pricesSnap = await getDocs(
            query(
              collection(db, "products", p.id, "prices"),
              where("active", "==", true),
              orderBy("unit_amount", "asc"),
            ),
          );

          items.push({
            id: p.id,
            ...(p.data() as any),
            prices: pricesSnap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as any),
            })),
          });
        }

        if (!cancelled) setProducts(items);
      } catch (e) {
        console.error("failed to load plans:", e);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [initialProducts.length]);

  const sortedProducts = useMemo(() => {
    const copy = [...(products ?? [])];

    copy.sort((a, b) => {
      const aSort = safeNum(a.metadata?.sort, 999);
      const bSort = safeNum(b.metadata?.sort, 999);
      if (aSort !== bSort) return aSort - bSort;

      const aAmt = a.prices?.[0]?.unit_amount ?? 0;
      const bAmt = b.prices?.[0]?.unit_amount ?? 0;
      return aAmt - bAmt;
    });

    return copy;
  }, [products]);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!sortedProducts.length) return;

    if (selectedPlanId && sortedProducts.some((p) => p.id === selectedPlanId))
      return;

    const premium =
      sortedProducts.find((p) => p.name?.toLowerCase().includes("premium")) ??
      sortedProducts[sortedProducts.length - 1];

    setSelectedPlanId(premium?.id ?? null);
  }, [sortedProducts, selectedPlanId]);

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    return sortedProducts.find((p) => p.id === selectedPlanId) ?? null;
  }, [selectedPlanId, sortedProducts]);

  const subscribeToPlan = async () => {
    if (!user || !selectedPlan) return;

    const priceId = selectedPlan.prices?.[0]?.id;
    if (!priceId) return;

    setBillingLoading(true);
    try {
      if (!user) throw new Error("not signed in");

      const priceId = selectedPlan?.prices?.[0]?.id;
      if (!priceId) throw new Error("no price id found for this plan");

      await startCheckout(user.uid, priceId);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "checkout failed");
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>Netflix</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2">
          <Link href="/" className="cursor-pointer">
            <Image
              src="https://rb.gy/ulxxee"
              alt="Netflix"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <button
            onClick={logout}
            type="button"
            className="cursor-pointer text-sm font-semibold text-black/80 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16 pt-14">
        <p className="mb-2 text-xs font-semibold tracking-wide text-black/60">
          STEP <span className="font-bold text-black">1</span> OF{" "}
          <span className="font-bold text-black">3</span>
        </p>

        <h1 className="mb-4 text-4xl font-extrabold leading-tight">
          Choose the plan that’s right for you
        </h1>

        <ul className="space-y-2">
          <li className="flex items-center gap-x-2 text-base">
            <CheckIcon className="h-6 w-6 text-[#E50914]" />
            No commitments, cancel anytime.
          </li>
          <li className="flex items-center gap-x-2 text-base">
            <CheckIcon className="h-6 w-6 text-[#E50914]" />
            Everything on Netflix for one low price.
          </li>
          <li className="flex items-center gap-x-2 text-base">
            <CheckIcon className="h-6 w-6 text-[#E50914]" />
            No ads and more ways to watch.
          </li>
        </ul>

        {productsLoading ? (
          <div className="mt-10 flex items-center justify-center">
            <Loader />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="mt-10 rounded-md border border-black/10 bg-white p-6">
            <p className="text-sm font-medium">No plans found.</p>
            <p className="mt-1 text-sm text-black/60">
              This usually means your Stripe products/prices haven’t synced into
              Firestore yet (or you’re fetching without{" "}
              <span className="font-mono">includePrices: true</span>).
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {sortedProducts.map((product) => {
                const isSelected = selectedPlan?.id === product.id;

                const badge = (
                  product.metadata?.badge as string | undefined
                )?.trim();

                const price = product.prices?.[0]?.unit_amount
                  ? `$${(product.prices[0].unit_amount / 100).toFixed(2)}`
                  : null;

                const quality =
                  (product.metadata?.quality as string | undefined) ??
                  (product.metadata?.videoQuality as string | undefined);

                const resolution = product.metadata?.resolution as
                  | string
                  | undefined;
                const streams = product.metadata?.streams as string | undefined;
                const downloads = product.metadata?.downloads as
                  | string
                  | undefined;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedPlanId(product.id)}
                    className={[
                      "relative cursor-pointer text-left",
                      "rounded-xl border bg-white overflow-hidden",
                      "min-h-[420px] flex flex-col",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/40",
                      isSelected
                        ? "border-[#E50914] shadow-lg -translate-y-0.5 ring-2 ring-[#E50914]/15"
                        : "border-black/10 shadow-sm hover:shadow-md hover:border-black/20 hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "absolute left-0 top-0 h-1 w-full transition-opacity",
                        isSelected
                          ? "bg-[#E50914] opacity-100"
                          : "bg-[#E50914] opacity-0",
                      ].join(" ")}
                    />

                    <div className="px-6 pt-6 pb-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xl font-extrabold">
                            {product.name}
                          </p>
                          {resolution ? (
                            <p className="mt-1 text-sm font-semibold text-black/70">
                              {resolution}
                            </p>
                          ) : null}
                        </div>

                        {badge ? (
                          <span className="rounded bg-[#E50914] px-2 py-1 text-xs font-semibold text-white">
                            {badge}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <p className="text-sm font-semibold text-black/50">
                        Monthly price
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-black">
                        {price ? `${price} / month` : "Price not found"}
                      </p>

                      <div className="my-5 h-px w-full bg-black/10" />

                      <div className="space-y-5">
                        {quality ? (
                          <div>
                            <p className="text-sm font-semibold text-black/50">
                              Video and sound quality
                            </p>
                            <p className="mt-1 text-base font-semibold text-black">
                              {quality}
                            </p>
                          </div>
                        ) : null}

                        {resolution ? (
                          <div className="pt-5 border-t border-black/10">
                            <p className="text-sm font-semibold text-black/50">
                              Resolution
                            </p>
                            <p className="mt-1 text-base font-semibold text-black">
                              {resolution}
                            </p>
                          </div>
                        ) : null}

                        {streams ? (
                          <div className="pt-5 border-t border-black/10">
                            <p className="text-sm font-semibold text-black/50">
                              Devices your household can watch at the same time
                            </p>
                            <p className="mt-1 text-base font-semibold text-black">
                              {streams}
                            </p>
                          </div>
                        ) : null}

                        {downloads ? (
                          <div className="pt-5 border-t border-black/10">
                            <p className="text-sm font-semibold text-black/50">
                              Download devices
                            </p>
                            <p className="mt-1 text-base font-semibold text-black">
                              {downloads}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-12 flex justify-center">
              <button
                disabled={!selectedPlan || isBillingLoading}
                className={[
                  "cursor-pointer w-full max-w-xl rounded bg-[#E50914] py-4 text-lg font-semibold text-white shadow transition",
                  "hover:bg-[#f6121d]",
                  isBillingLoading || !selectedPlan
                    ? "opacity-60 cursor-not-allowed hover:bg-[#E50914]"
                    : "",
                ].join(" ")}
                onClick={subscribeToPlan}
                type="button"
              >
                {isBillingLoading ? <Loader colorClass="text-white" /> : "Next"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Plans;
