"use client";

import MuiModal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Image from "next/image";
import ReactPlayer from "react-player";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { AiOutlineLike } from "react-icons/ai";
import { HiOutlineVolumeOff, HiOutlineVolumeUp } from "react-icons/hi";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/outline";

import useList from "@/hooks/useList";
import useAuth from "@/hooks/useAuth";
import { addToMyList, removeFromMyList } from "@/lib/myList";
import { useModalStore } from "../store/modalStore";
import { GENRE_MAP } from "../constants/genres";
import { Movie } from "@/typings";

type TMDBVideo = {
  key: string;
  site: string;
  type: string;
  name?: string;
};

export default function Modal() {
  const isOpen = useModalStore((s) => s.isOpen);
  const movie = useModalStore((s) => s.movie);
  const close = useModalStore((s) => s.close);

  const { user } = useAuth();
  const list = useList(user?.uid);

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [canAutoPlay, setCanAutoPlay] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const fetchIdRef = useRef(0);

  const genres = useMemo<string[]>(() => {
    if (!movie) return [];

    if ("genres" in (movie as any) && Array.isArray((movie as any).genres)) {
      return (movie as any).genres.map((g: any) => g.name).filter(Boolean);
    }

    return (movie.genre_ids || [])
      .map((id: number) => GENRE_MAP[id])
      .filter(Boolean);
  }, [movie]);

  const title = useMemo(() => {
    if (!movie) return "untitled";
    return movie.title || movie.name || movie.original_name || "untitled";
  }, [movie]);

  const backdrop = useMemo(() => {
    if (!movie) return null;
    return movie.backdrop_path || movie.poster_path || null;
  }, [movie]);

  const year = useMemo(() => {
    if (!movie) return "";
    return (
      (movie.release_date && movie.release_date.slice(0, 4)) ||
      (movie.first_air_date && movie.first_air_date.slice(0, 4)) ||
      ""
    );
  }, [movie]);

  const genresText = useMemo(() => {
    return genres.length ? genres.join(", ") : "—";
  }, [genres]);

  const videoUrl = useMemo(() => {
    if (!trailerKey) return null;
    return `https://www.youtube.com/embed/${trailerKey}`;
  }, [trailerKey]);

  // ✅ My List toggle state
  const inList = useMemo(() => {
    if (!movie) return false;
    return list?.some((m: any) => String(m.id) === String(movie.id)) ?? false;
  }, [list, movie]);

  const toggleMyList = async () => {
    if (!user?.uid || !movie) return;

    if (inList) {
      await removeFromMyList(user.uid, movie.id);
    } else {
      await addToMyList(user.uid, movie as Movie);
    }
  };

  useEffect(() => {
    if (!movie) {
      setTrailerKey(null);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      setTrailerKey(null);
      return;
    }

    const currentMovie = movie;
    setTrailerKey(null);

    const controller = new AbortController();
    const myFetchId = ++fetchIdRef.current;

    async function run() {
      try {
        const endpointType = currentMovie.media_type === "tv" ? "tv" : "movie";

        const res = await fetch(
          `https://api.themoviedb.org/3/${endpointType}/${currentMovie.id}?api_key=${apiKey}&language=en-US&append_to_response=videos`,
          { signal: controller.signal },
        );

        const data = await res.json();
        const results: TMDBVideo[] = data?.videos?.results || [];

        const pick =
          results.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
          results.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
          results.find((v) => v.site === "YouTube");

        if (fetchIdRef.current !== myFetchId) return;

        setTrailerKey(pick?.key ?? null);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.log(err?.message || err);
      }
    }

    run();
    return () => controller.abort();
  }, [movie]);

  useEffect(() => {
    setCanAutoPlay(false);
    setUserStarted(false);

    if (!isOpen || !videoUrl) return;

    const t = setTimeout(() => setCanAutoPlay(true), 250);
    return () => clearTimeout(t);
  }, [isOpen, videoUrl]);

  if (!movie) return null;

  return (
    <MuiModal
      open={isOpen}
      onClose={close}
      closeAfterTransition
      disableAutoFocus
      slotProps={{ backdrop: { className: "bg-black/80" } }}
    >
      <Fade in={isOpen} timeout={220}>
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className={[
              "relative w-full max-w-5xl overflow-hidden rounded-md bg-[#181818] shadow-2xl",
              "transform transition-transform duration-200 ease-out",
              isOpen ? "scale-100" : "scale-[0.97]",
            ].join(" ")}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white hover:bg-black/90 cursor-pointer"
              aria-label="close"
            >
              ✕
            </button>

            <div className="max-h-[92vh] overflow-y-auto">
              <div className="relative aspect-video w-full bg-black">
                {videoUrl ? (
                  <div className="absolute inset-0">
                    <ReactPlayer
                      key={trailerKey ?? "no-trailer"}
                      url={videoUrl}
                      width="100%"
                      height="100%"
                      playing={Boolean(isOpen && (userStarted || canAutoPlay))}
                      muted={isMuted}
                      volume={isMuted ? 0 : 1}
                      loop
                      controls={false}
                      playsinline
                      stopOnUnmount
                      onError={(e) => console.log("ReactPlayer error:", e)}
                      config={
                        {
                          youtube: {
                            playerVars: {
                              autoplay: 1,
                              controls: 0,
                              modestbranding: 1,
                              rel: 0,
                              playsinline: 1,
                            },
                          },
                        } as any
                      }
                    />
                  </div>
                ) : backdrop ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/original${backdrop}`}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1100px"
                  />
                ) : (
                  <div className="h-full w-full bg-zinc-800" />
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#181818] via-black/15 to-black/10" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />

                <div className="absolute bottom-10 left-6 z-10 max-w-[70%] md:left-10">
                  <p className="text-xs font-bold tracking-[0.35em] text-red-600">
                    NETFLIX
                  </p>

                  <h1 className="mt-2 text-3xl font-extrabold leading-none md:text-5xl lg:text-6xl">
                    {title}
                  </h1>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                    {movie.media_type
                      ? String(movie.media_type)
                      : "series / film"}
                  </p>

                  <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-white/90 line-clamp-3 md:text-base">
                    {movie.overview || "add your teaser line here later."}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      className="inline-flex items-center gap-2 rounded bg-white px-6 py-2 text-sm font-bold text-black hover:opacity-90 cursor-pointer"
                      onClick={() => setUserStarted(true)}
                    >
                      <FaPlay className="h-4 w-4" />
                      Play
                    </button>

                    {/* ✅ My List toggle */}
                    <button
                      type="button"
                      onClick={toggleMyList}
                      className={[
                        "grid h-11 w-11 place-items-center rounded-full border cursor-pointer transition",
                        inList
                          ? "bg-white border-white hover:bg-white/90"
                          : "bg-black/30 border-white/40 hover:border-white",
                      ].join(" ")}
                      aria-label={
                        inList ? "Remove from My List" : "Add to My List"
                      }
                    >
                      {inList ? (
                        <CheckIcon className="h-6 w-6 text-black" />
                      ) : (
                        <PlusIcon className="h-6 w-6 text-white" />
                      )}
                    </button>

                    <button
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-black/30 hover:border-white cursor-pointer"
                      aria-label="like"
                    >
                      <AiOutlineLike className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="absolute bottom-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-black/30 hover:border-white cursor-pointer"
                  aria-label={isMuted ? "unmute" : "mute"}
                >
                  {isMuted ? (
                    <HiOutlineVolumeOff className="h-6 w-6" />
                  ) : (
                    <HiOutlineVolumeUp className="h-6 w-6" />
                  )}
                </button>
              </div>

              <div className="px-6 pb-10 pt-6 md:px-10">
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                  {year && <span className="text-white/90">{year}</span>}

                  <span className="rounded border border-white/30 px-2 py-[2px] text-xs font-semibold">
                    TV-14
                  </span>

                  <span className="rounded border border-white/30 px-2 py-[2px] text-xs font-semibold">
                    HD
                  </span>

                  {typeof movie.vote_average === "number" && (
                    <span className="text-green-400 font-semibold">
                      {Math.round(movie.vote_average * 10)}% match
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-base">
                      {movie.overview || "no description yet."}
                    </p>
                  </div>

                  <div className="space-y-4 text-sm text-white/70">
                    <p>
                      <span className="text-white/45">Genres:</span>{" "}
                      <span className="text-white/85">{genresText}</span>
                    </p>

                    <p>
                      <span className="text-white/45">Language:</span>{" "}
                      <span className="text-white/85">
                        {(movie.original_language || "").toUpperCase() || "—"}
                      </span>
                    </p>

                    <p>
                      <span className="text-white/45">This Movie Is:</span>{" "}
                      <span className="text-white/85">
                        {movie.vote_average
                          ? movie.vote_average >= 7.5
                            ? "Exciting, Emotional"
                            : "Binge-worthy"
                          : "—"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </MuiModal>
  );
}
