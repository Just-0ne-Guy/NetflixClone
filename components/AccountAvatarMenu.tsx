"use client";


import { auth } from "@/lib/firebase";
import {
  ArrowsRightLeftIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function AccountAvatarMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setOpen(true);
  };

  const closeMenuWithDelay = (delay = 200) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const doSignOut = async () => {
    try {
      await signOut(auth);
      setOpen(false);
      router.replace("/login"); // or "/plan" if you want
      router.refresh();
    } catch (e) {
      console.error("sign out failed:", e);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={() => closeMenuWithDelay(200)}
    >
      <div className="flex items-center gap-1 cursor-pointer">
        <img
          src="https://rb.gy/g1pwyx"
          alt="profile"
          className="h-8 w-8 rounded object-cover"
        />
        <ChevronDownIcon
          className={`h-4 w-4 text-white/80 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      <div
        onMouseEnter={openMenu}
        onMouseLeave={() => closeMenuWithDelay(200)}
        className={[
          "absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden ",
          "bg-black/80 text-white shadow-xl ring-1 ring-white/10",
          "origin-top-right transition-all duration-200 ease-out",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none",
        ].join(" ")}
      >

        <div className="py-0 text-sm">
          {/* account just routes to account page */}
          <Link
            href="/account"
            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer"
          >
            <UserCircleIcon className="h-5 w-5 text-white/80" />
            <span>Account</span>
          </Link>

          {/* visual only */}
          <button
            type="button"
            className="cursor-not-allowed w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-left"
          >
            <PencilSquareIcon className="h-5 w-5 text-white/80" />
            <span>Manage Profiles</span>
          </button>

          {/* visual only */}
          <button
            type="button"
            className="cursor-not-allowed w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-left"
          >
            <QuestionMarkCircleIcon className="h-5 w-5 text-white/80" />
            <span>Help Center</span>
          </button>


        <button
          type="button"
          onClick={doSignOut}
          className="cursor-pointer w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <ArrowsRightLeftIcon className="h-5 w-5 text-white/80" />
            <span>Switch Profile</span>
          </div>
        </button>
        </div>

        <div className="h-px bg-white/10" />


        <button
          type="button"
          onClick={doSignOut}
          className="cursor-pointer w-full px-4 py-3 text-center text-sm font-semibold hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
