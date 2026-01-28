
import HomeClient from "@/componets/HomeClient";
import requests from "@/utils/requests";
import payments from "@/lib/stripe";
import { getProducts, Product } from "@stripe/firestore-stripe-payments";
import { Movie } from "@/typings";

type HomeProps = {
  netflixOriginals: Movie[];
  trendingNow: Movie[];
  topRated: Movie[];
  actionMovies: Movie[];
  comedyMovies: Movie[];
  horrorMovies: Movie[];
  romanceMovies: Movie[];
  documentaries: Movie[];
  products: Product[];
};

async function fetcher(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return res.json();
}

export default async function Page() {
  const products = await getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  }).catch(() => []);

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
    fetcher(requests.fetchNetflixOriginals),
    fetcher(requests.fetchTrending),
    fetcher(requests.fetchTopRated),
    fetcher(requests.fetchActionMovies),
    fetcher(requests.fetchComedyMovies),
    fetcher(requests.fetchHorrorMovies),
    fetcher(requests.fetchRomanceMovies),
    fetcher(requests.fetchDocumentaries),
  ]);

  const props: HomeProps = {
    netflixOriginals: netflixOriginals?.results ?? [],
    trendingNow: trendingNow?.results ?? [],
    topRated: topRated?.results ?? [],
    actionMovies: actionMovies?.results ?? [],
    comedyMovies: comedyMovies?.results ?? [],
    horrorMovies: horrorMovies?.results ?? [],
    romanceMovies: romanceMovies?.results ?? [],
    documentaries: documentaries?.results ?? [],
    products: Array.isArray(products) ? products : [],
  };

  return <HomeClient {...props} />;
}
