"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useAuth from "@/hooks/useAuth";
import AccountAvatarMenu from "@/components/AccountAvatarMenu";
import { goToBillingPortal } from "@/lib/stripe";
import type { Timestamp } from "firebase/firestore";


type LooseTimestamp = Timestamp | { seconds: number } | number | Date | null | undefined;

type SubscriptionItem = {
  price?: { id?: string };
  quantity?: number;
  [key: string]: unknown;
};

type SubDoc = {
  status?: string;
  current_period_end?: LooseTimestamp;
  created?: LooseTimestamp;
  items?: SubscriptionItem[];
};

function toDateLabel(ts: LooseTimestamp) {
  try {
    if (!ts) return "--";

    const d =
      ts instanceof Date
        ? ts
        : typeof ts === "number"
          ? new Date(ts * 1000)
          : typeof (ts as { toDate?: unknown })?.toDate === "function"
            ? (ts as Timestamp).toDate()
            : typeof (ts as { seconds?: unknown })?.seconds === "number"
              ? new Date((ts as { seconds: number }).seconds * 1000)
              : null;

    if (!d) return "--";

    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "--";
  }
}

export default function AccountPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<SubDoc | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageMembership = async () => {
    if (!user?.uid) return;

    setPortalLoading(true);
    try {
      await goToBillingPortal(user.uid, `${window.location.origin}/account`);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "failed to open billing portal");
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const subsRef = collection(db, "customers", user.uid, "subscriptions");

    const unsub = onSnapshot(
      subsRef,
      (snap) => {
        if (snap.empty) {
          setSub(null);
          return;
        }

        const docs = snap.docs.map((d) => d.data() as SubDoc);
        const active = docs.find(
          (d) => d.status === "active" || d.status === "trialing",
        );
        setSub(active ?? docs[0] ?? null);
      },
      (err) => {
        console.error("subscription read error:", err);
        setSub(null);
      },
    );

    return () => unsub();
  }, [user?.uid]);

  const planName = useMemo(() => {
    const maybe =
      sub?.items?.[0]?.price?.product?.name ||
      sub?.items?.[0]?.price?.product?.metadata?.name ||
      sub?.items?.[0]?.price?.nickname ||
      null;
    return maybe ?? "—";
  }, [sub]);

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* top nav */}
      <header className="sticky top-0 z-50 py-4 border-b border-white/10 bg-[#141414]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2">
          <Link href="/" className="flex items-center">
            <img
              src="https://rb.gy/ulxxee"
              alt="Netflix"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <AccountAvatarMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Netflix
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            <SidebarItem icon={HomeIcon} label="Overview" active />
            <SidebarItem icon={CreditCardIcon} label="Membership" />
            <SidebarItem icon={ShieldCheckIcon} label="Security" />
            <SidebarItem icon={DevicePhoneMobileIcon} label="Devices" />
            <SidebarItem icon={UserGroupIcon} label="Profiles" />
          </aside>

          <section className="space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Account
              </h1>
              <p className="mt-1 text-lg text-white/70">Membership Details</p>
              <p className="mt-2 text-sm text-white/60">
                Signed in as{" "}
                <span className="text-white">{user?.email ?? "—"}</span>
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1f]">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#2a2a2a] px-6 py-4">
                <div className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold">
                  {sub?.status
                    ? `Status: ${sub.status}`
                    : "No active membership"}
                </div>
                <span className="text-sm text-white/60">Membership</span>
              </div>

              <div className="px-6 py-6">
                <div className="text-2xl font-bold">
                  {planName === "—" ? "Plan" : planName}
                </div>
                <div className="mt-2 text-white/70">
                  Next payment:{" "}
                  <span className="text-white">
                    {toDateLabel(sub?.current_period_end)}
                  </span>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <button
                    onClick={handleManageMembership}
                    disabled={portalLoading}
                    className="cursor-pointer flex w-full items-center justify-between rounded-lg px-2 py-3 text-left hover:bg-white/5 transition disabled:opacity-60"
                  >
                    <span className="text-lg font-semibold">
                      {portalLoading
                        ? `Opening billing portal...` 
                        : "Manage membership"}
                    </span>
                    <ChevronRightIcon className="h-5 w-5 text-white/70" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1f]">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="text-lg font-semibold">Quick Links</div>
              </div>

              <div className="divide-y divide-white/10">
                <QuickLink label="Change plan" />
                <QuickLink label="Manage payment method" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-lg px-4 py-3 transition cursor-pointer",
        active ? "bg-white/10" : "hover:bg-white/5",
      ].join(" ")}
    >
      <Icon className="h-6 w-6 text-white/80" />
      <span className="text-base font-semibold text-white/90">{label}</span>
    </div>
  );
}

function QuickLink({ label }: { label: string }) {
  return (
    <button className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition cursor-pointer">
      <span className="text-base font-semibold">{label}</span>
      <ChevronRightIcon className="h-5 w-5 text-white/70" />
    </button>
  );
}
