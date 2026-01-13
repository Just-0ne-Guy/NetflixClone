"use client";

import Modal from "@/componets/Modal";
// import { useRecoilValue } from "recoil";
// import { modalState } from "@/atoms/modalAtom";
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
//   const showModal = useRecoilValue(modalState);

  return (
    <div className="relative h-screen lg:h-[140vh]">
      <Header />
      <main className="relative pl-4 pb-24 lg:space-y-24 lg:pl-16 pt-16">
        <Banner netflixOriginals={props.netflixOriginals} />
        <section className="md:space-y-24">
          <Row title="Trending Now" movies={props.trendingNow} />
          <Row title="Top Rated" movies={props.topRated} />
          <Row title="Action Thrillers" movies={props.actionMovies} />
          <Row title="Comedies" movies={props.comedyMovies} />
          <Row title="Scary Movies" movies={props.horrorMovies} />
          <Row title="Romance Movies" movies={props.romanceMovies} />
          <Row title="Documentaries" movies={props.documentaries} />
        </section>
      </main>

      {/* {showModal && <Modal />} */}
    </div>
  );
}