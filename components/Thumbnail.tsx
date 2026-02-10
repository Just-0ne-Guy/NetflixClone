"use client";

import { Movie } from "@/typings";
import Image from "next/image";
import { useModalStore } from "../store/modalStore";

interface Props {
  movie: Movie;
}

function Thumbnail({ movie }: Props) {
  const openModal = useModalStore((s) => s.open);

  return (
    <div
      onClick={() => openModal(movie)}
      className="relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105"
    >
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`}
        alt={`${movie.title || movie.name || "Movie"} thumbnail`}
        className="rounded-sm object-cover md:rounded"
        fill
        sizes="(max-width: 768px) 180px, 260px"
      />
    </div>
  );
}

export default Thumbnail;
