import Banner from "@/componets/Banner";
import Header from "@/componets/Header";
import Row from "@/componets/Row";
import { Movie } from "@/typings";
import requests from "@/utils/requests";

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

async function getMovies(url: string) {
  const res = await fetch(url, { cache: "no-store" }); // SSR-like (fresh each request)
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
}

export default async function Home() {
  const [
    netflixOriginals,
    trendingNow,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    documentaries,
  ] = await Promise.all([
    getMovies(requests.fetchNetflixOriginals),
    getMovies(requests.fetchTrending),
    getMovies(requests.fetchTopRated),
    getMovies(requests.fetchActionMovies),
    getMovies(requests.fetchComedyMovies),
    getMovies(requests.fetchHorrorMovies),
    getMovies(requests.fetchRomanceMovies),
    getMovies(requests.fetchDocumentaries),
  ]);

  const props: Props = {
    netflixOriginals: netflixOriginals.results,
    trendingNow: trendingNow.results,
    topRated: topRated.results,
    actionMovies: actionMovies.results,
    comedyMovies: comedyMovies.results,
    horrorMovies: horrorMovies.results,
    romanceMovies: romanceMovies.results,
    documentaries: documentaries.results,
  };

  return (
    <div className="relative h-screen lg:h-[140vh]">
      <Header />
      <main className="relative pl-4 pb-24 lg:space-y-24 lg:pl-16 pt-16">
        <Banner netflixOriginals={props.netflixOriginals} />
        <section className="md:space-y-24">
          <Row title="Trending Now" movies={props.trendingNow} />
          <Row title="Top Rated" movies={props.topRated} />
          <Row title="Action Thrillers" movies={props.actionMovies} />
          {/* My List Component */}
          <Row title="Comedies" movies={props.comedyMovies} />
          <Row title="Scary Movies" movies={props.horrorMovies} />
          <Row title="Romance Movies" movies={props.romanceMovies} />
          <Row title="Documentaries" movies={props.documentaries} />
        </section>
      </main>
      {/* Modal */}
    </div>
  );
}
