
import HomeClient from "@/componets/HomeClient";
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
  const res = await fetch(url, { cache: "no-store" });
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

  return <HomeClient {...props} />;
}