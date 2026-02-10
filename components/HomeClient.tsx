"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Modal from "@/components/Modal";
import Banner from "@/components/Banner";
import Header from "@/components/Header";
import Row from "@/components/Row";
import useList from "@/hooks/useList";
import { Movie } from "@/typings";
import useAuth from "@/hooks/useAuth";
import useSubscription from "@/hooks/useSubscription";
import { useModalStore } from "../store/modalStore";
import useSubscriptionStatus from "@/hooks/useSubscriptionStatus";


interface Props {
  netflixOriginals: Movie[];
  trendingNow: Movie[];
  topRated: Movie[];
  actionMovies: Movie[];
  comedyMovies: Movie[];
  horrorMovies: Movie[];
  romanceMovies: Movie[];
  documentaries: Movie[];
}


export default function HomeClient(props: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subLoading } = useSubscriptionStatus(user);
  const isOpen = useModalStore((s) => s.isOpen);
  const list = useList(user?.uid)
  const myList = (list as unknown as Movie[]) || [];

  useEffect(() => {
    if (!authLoading && user && !subLoading && !isSubscribed) {
      router.replace("/plan");
    }
  }, [authLoading, user, subLoading, isSubscribed, router]);

  if (authLoading || (user && subLoading)) {
    return <div className="min-h-screen bg-black grid place-items-center text-white">loading...</div>;
  }

  if (user && !isSubscribed) {
    return <div className="min-h-screen bg-black" />; // redirecting
  }

  // subscribed → home
  return (
    <div
      className={[
        "relative min-h-screen bg-gradient-to-b",
        isOpen ? "h-screen overflow-hidden" : "",
      ].join(" ")}
    >
      <Header />

      <main className="relative pb-24 pt-16">
        <Banner netflixOriginals={props.netflixOriginals} />

        <section className="mt-24 space-y-8 md:space-y-10 lg:space-y-12">
          <Row title="Trending Now" movies={props.trendingNow} />
          <Row title="Top Rated" movies={props.topRated} />
          <Row title="Action Thrillers" movies={props.actionMovies} />
          {myList.length > 0 && <Row title="My List" movies={myList} />}
          <Row title="Comedies" movies={props.comedyMovies} />
          <Row title="Scary Movies" movies={props.horrorMovies} />
          <Row title="Romance Movies" movies={props.romanceMovies} />
          <Row title="Documentaries" movies={props.documentaries} />
        </section>
      </main>

      <Modal />
    </div>
  );
}
