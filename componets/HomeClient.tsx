"use client";

import Header from "./Header";
import Banner from "./Banner";
import Row from "./Row";
import Modal from "./Modal";
import Plans from "./Plans";
import Loader from "./Loader";

import useAuth from "../hooks/useAuth";
import useSubscription from "../hooks/useSubscription";

import { useRecoilValue } from "recoil";
import { modalState } from "../atoms/modalAtom";
import { DocumentData } from "firebase/firestore";
import { Movie } from "../typings";

interface Props {
  netflixOriginals: Movie[] | DocumentData[];
  trendingNow: Movie[] | DocumentData[];
  topRated: Movie[] | DocumentData[];
  actionMovies: Movie[] | DocumentData[];
  comedyMovies: Movie[] | DocumentData[];
  horrorMovies: Movie[] | DocumentData[];
  romanceMovies: Movie[] | DocumentData[];
  documentaries: Movie[] | DocumentData[];
}

export default function HomeClient({
  netflixOriginals,
  trendingNow,
  topRated,
  actionMovies,
  comedyMovies,
  horrorMovies,
  romanceMovies,
  documentaries,
}: Props) {
  const { loading, user } = useAuth();
  const showModal = useRecoilValue(modalState);
  const { subscription, loading: subLoading } = useSubscription(user);

  if (loading || subLoading) {
    return <Loader />;
  }

  if (!subscription) {
    return <Plans />;
  }

  // subscribed => normal netflix UI
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900/10 to-[#010511] lg:bg-[#010511]">
      <Header />

      <main className="relative pb-24">
        <Banner netflixOriginals={netflixOriginals} />

        <section className="space-y-8 md:space-y-10">
          <Row title="Trending Now" movies={trendingNow} />
          <Row title="Top Rated" movies={topRated} />
          <Row title="Action Thrillers" movies={actionMovies} />
          <Row title="Comedies" movies={comedyMovies} />
          <Row title="Scary Movies" movies={horrorMovies} />
          <Row title="Romance Movies" movies={romanceMovies} />
          <Row title="Documentaries" movies={documentaries} />
        </section>
      </main>

      {showModal && <Modal />}
    </div>
  );
}
