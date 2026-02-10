"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  ArrowsRightLeftIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const NAV_ITEMS = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [browseOpen, setBrowseOpen] = useState(false);

  const openBrowse = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setBrowseOpen(true);
  };

  const scheduleCloseBrowse = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setBrowseOpen(false), 200);
  };

  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMenuOpen(true);
  };

  const closeMenuWithDelay = (delay = 200) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    closeTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
      closeTimerRef.current = null;
    }, delay);
  };

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuOpen(false);
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("logout failed:", e);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showSearch) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  useEffect(() => {
    if (!showSearch) return;

    const onDown = (e: MouseEvent) => {
      const wrap = searchWrapRef.current;
      if (!wrap) return;

      if (!wrap.contains(e.target as Node)) {
        setShowSearch(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showSearch]);

  return (
    <header
      className={[
        "fixed top-0 left-0 z-50 w-full",
        "transition-all duration-300",
        "px-4 py-3 lg:px-10 lg:py-4",
        isScrolled
          ? "bg-[#141414]"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent",
      ].join(" ")}
    >
      {/* left */}
      <div className="flex items-center gap-3 md:gap-10">
        <Link href="/" aria-label="go home">
          <img
            src="https://rb.gy/ulxxee"
            alt="netflix logo"
            className="h-5 w-auto cursor-pointer object-contain md:h-6"
          />
        </Link>

        <nav className="hidden md:flex">
          <ul className="flex items-center gap-4 lg:gap-5">
            {NAV_ITEMS.map((label) => (
              <li key={label} className="header__link">
                {label}
              </li>
            ))}
          </ul>
        </nav>

        {/* mobile browse (only shows when browse button appears) */}
        <div
          className="relative md:hidden"
          onMouseEnter={openBrowse}
          onMouseLeave={scheduleCloseBrowse}
        >
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white cursor-default"
            aria-haspopup="menu"
            aria-expanded={browseOpen}
          >
            Browse
            <ChevronDownIcon className="h-4 w-4 text-white/70" />
          </button>

          {/* dropdown */}
          <div
            className={[
              "absolute left-0 mt-2 w-56 border border-white/10 bg-black/80 shadow-xl z-50",
              "transition-all duration-150 origin-top",
              browseOpen
                ? "opacity-100 translate-y-0 scale-100"
                : "pointer-events-none opacity-0 -translate-y-1 scale-95",
            ].join(" ")}
          >
            <ul className="py-2 text-center">
              {["Home", "TV Shows", "Movies", "New & Popular", "My List"].map(
                (label) => (
                  <li key={label}>
                    <div className="px-4 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white select-none">
                      {label}
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm font-light">
        <div ref={searchWrapRef} className="relative flex items-center">
          <div
            className={[
              "flex items-center overflow-hidden",
              "h-9",
              "transition-all duration-300 ease-out",
              showSearch
                ? "w-64 bg-black/70 border border-white/80 px-3"
                : "w-9 bg-transparent border border-transparent px-0",
            ].join(" ")}
          >
            <button
              type="button"
              aria-label="search"
              onClick={() => setShowSearch((v) => !v)}
              className={[
                "cursor-pointer",
                "p-0 m-0 border-0 bg-transparent",
                "outline-none focus:outline-none focus:ring-0",
                "focus-visible:outline-none focus-visible:ring-0",
              ].join(" ")}
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-white" />
            </button>

            <div
              className={[
                "ml-3 flex-1",
                "transition-all duration-300 ease-out",
                showSearch
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-2 pointer-events-none",
              ].join(" ")}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Titles, people, genres"
                className={[
                  "w-full bg-transparent text-sm text-white placeholder:text-white/60",
                  "outline-none focus:outline-none focus:ring-0",
                ].join(" ")}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowSearch(false);
                    inputRef.current?.blur();
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    const wrap = searchWrapRef.current;
                    const active = document.activeElement;
                    if (wrap && active && wrap.contains(active)) return;
                    setShowSearch(false);
                  }, 0);
                }}
              />
            </div>
          </div>
        </div>

        <p className="hidden lg:inline header__link">Kids</p>
        <BellIcon className="header__icon h-6 w-6" />

        <div
          className="relative"
          onMouseEnter={openMenu}
          onMouseLeave={() => closeMenuWithDelay(200)}
        >
          {/* trigger */}
          <div className="flex items-center gap-1 cursor-pointer">
            <img
              src="https://rb.gy/g1pwyx"
              alt="profile"
              className="h-8 w-8 cursor-pointer rounded object-cover"
            />
            <ChevronDownIcon
              className={`hidden lg:inline h-4 w-4 text-white/80 transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* dropdown (always mounted for fade out; pointer-events toggled) */}
          <div
            onMouseEnter={openMenu}
            onMouseLeave={() => closeMenuWithDelay(200)}
            className={[
              "absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden",
              "bg-black/80 text-white shadow-xl ring-1 ring-white/10",
              "origin-top-right transition-all duration-200 ease-out",
              menuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-1 pointer-events-none",
            ].join(" ")}
          >
            <div className="py-0 text-sm">
              <div className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer">
                <PencilSquareIcon className="h-5 w-5 text-white/80" />
                <span>Manage Profiles</span>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer">
                <ArrowsRightLeftIcon className="h-5 w-5 text-white/80" />
                <span>Transfer Profile</span>
              </div>

              <Link
                href="/account"
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/10"
              >
                <UserCircleIcon className="h-5 w-5 text-white/80" />
                <span>Account</span>
              </Link>

              <div className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 cursor-pointer">
                <QuestionMarkCircleIcon className="h-5 w-5 text-white/80" />
                <span>Help Center</span>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-3 text-sm font-semibold hover:bg-white/10 text-center cursor-pointer"
            >
              Sign out of Netflix
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
