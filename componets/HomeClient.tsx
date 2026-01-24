"use client";

import Modal from "@/componets/Modal";
import Banner from "@/componets/Banner";
import Header from "@/componets/Header";
import Row from "@/componets/Row";
import { Movie } from "@/typings";

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
  return (
    <div className="relative min-h-screen bg-gradient-to-b">
      <Header />

      <main className="relative pb-24 pt-16">
        <Banner netflixOriginals={props.netflixOriginals} />

        <section className="mt-24 space-y-8 md:space-y-10 lg:space-y-12">
          <Row title="Trending Now" movies={props.trendingNow} />
          <Row title="Top Rated" movies={props.topRated} />
          <Row title="Action Thrillers" movies={props.actionMovies} />
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
