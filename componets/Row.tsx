"use client";

import { Movie } from "@/typings";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import Thumbnail from "./Thumbnail";

interface Props {
  title: string;
  movies: Movie[];
}

export default function Row({ title, movies }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  useEffect(() => {
    if (rowRef.current) rowRef.current.scrollLeft = 0;
  }, []);

  const handleClick = (direction: "left" | "right") => {
    if (!rowRef.current) return;

    const { scrollLeft, clientWidth } = rowRef.current;
    const step = Math.round(clientWidth * 0.75);

    const scrollTo =
      direction === "left" ? scrollLeft - step : scrollLeft + step;

    rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    setIsMoved(rowRef.current.scrollLeft > 5);
  };

  return (
    <section className="space-y-2 md:space-y-4">
      {/* title + row use same gutter */}
      <h2 className="px-6 md:px-10 lg:px-16 text-sm font-semibold text-[#e5e5e5] transition hover:text-white md:text-2xl">
        {title}
      </h2>

      <div className="group relative">
        <ChevronLeftIcon
          className={[
            "absolute left-3 top-0 bottom-0 z-40 m-auto h-9 w-9",
            "cursor-pointer text-white/90",
            "opacity-0 transition hover:scale-125 group-hover:opacity-100",
            !isMoved ? "hidden" : "",
          ].join(" ")}
          onClick={() => handleClick("left")}
        />

        {/* scroller stays aligned with the title */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className={[
            "flex items-center space-x-0.5 md:space-x-2.5",
            "overflow-x-scroll overflow-y-hidden scrollbar-hide scroll-smooth",
            "snap-x snap-mandatory",
            "px-6 md:px-10 lg:px-16",
            "py-2",
          ].join(" ")}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="shrink-0 snap-start">
              <Thumbnail movie={movie} />
            </div>
          ))}
        </div>

        <ChevronRightIcon
          className={[
            "absolute right-3 top-0 bottom-0 z-40 m-auto h-9 w-9",
            "cursor-pointer text-white/90",
            "opacity-0 transition hover:scale-125 group-hover:opacity-100",
          ].join(" ")}
          onClick={() => handleClick("right")}
        />
      </div>
    </section>
  );
}
