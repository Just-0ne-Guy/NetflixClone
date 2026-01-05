"use client";

import { baseUrl } from "@/constants/movie";
import { Movie } from "@/typings";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";

interface Props {
  netflixOriginals: Movie[];
}

function Banner({ netflixOriginals }: Props) {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    setMovie(
      netflixOriginals[Math.floor(Math.random() * netflixOriginals.length)]
    );
  }, [netflixOriginals]);

  return (
    <div className=" flex flex-col space-y-2 py-16 md:space-y-4 lg:h-[65vh] lg:justify-end lg:pb-12">
      <div className="absolute top-0 left-0 -z-10 h-[95vh] w-full">
        <Image
          src={`${baseUrl}${movie?.backdrop_path || movie?.poster_path}`}
          alt={movie?.title || movie?.name || "Netflix banner"}
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute inset-0 netflix-gradient" />
      </div>
      <div className="px-6 md:px-12 lg:px-24 max-w-3xl">
        <h1 className="text-3xl font-bold md:text-5xl lg:text-6xl leading-tight">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        <p className="mt-4 text-sm text-shadow-md md:text-base text-gray-200 leading-relaxed line-clamp-3">
          {movie?.overview}
        </p>

        <div className="mt-6 flex gap-3">
          <button className="banner__button bg-white text-black">
            <FaPlay className="h-4 w-4 text-black md:h-5 md:w-5" />
            Play
          </button>
          <button className="banner__button bg-[gray]/60 text-white">
            <AiOutlineInfoCircle className="h-5 w-5 md:h-7 md:w-7" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
