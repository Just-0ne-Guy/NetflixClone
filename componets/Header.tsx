"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const NAV_ITEMS = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [showSearch, setShowSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  // focus input when opening
  useEffect(() => {
    if (showSearch) {
      // let the container expand first for a smoother feel
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [showSearch]);

  // close when clicking outside
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

        {/* desktop links */}
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-4 lg:gap-5">
            {NAV_ITEMS.map((label) => (
              <li key={label} className="header__link">
                {label}
              </li>
            ))}
          </ul>
        </nav>

        {/* mobile browse */}
        <button
          className="md:hidden inline-flex items-center gap-1 text-sm text-[#e5e5e5] hover:text-[#b3b3b3] transition"
          aria-label="browse"
          type="button"
        >
          Browse
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </div>

      {/* right */}
      <div className="flex items-center gap-4 text-sm font-light">
        {/* SEARCH */}
        <div ref={searchWrapRef} className="relative flex items-center">
          <div
            className={[
              "flex items-center overflow-hidden",
              "h-9",
              "transition-all duration-300 ease-out",
              // open = netflix box, closed = invisible container (no border/bg)
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

            {/* input slides/fades in smoothly */}
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
                  // blur from clicking away is already handled by outside-click,
                  // but this helps if blur happens for other reasons
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

        <Link href="/account" className="flex items-center gap-1">
          <img
            src="https://rb.gy/g1pwyx"
            alt="profile"
            className="h-8 w-8 cursor-pointer rounded object-cover"
          />
          <ChevronDownIcon className="hidden lg:inline h-4 w-4 text-white/80" />
        </Link>
      </div>
    </header>
  );
}

export default Header;
