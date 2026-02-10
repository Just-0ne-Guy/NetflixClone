import { db } from "./firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import type { Movie } from "@/typings";

export async function addToMyList(uid: string, movie: Movie) {
  // store the movie under its id so it's easy to check/remove
  await setDoc(doc(db, "customers", uid, "myList", String(movie.id)), {
    ...movie,
    addedAt: Date.now(),
  });
}

export async function removeFromMyList(uid: string, movieId: number | string) {
  await deleteDoc(doc(db, "customers", uid, "myList", String(movieId)));
}
