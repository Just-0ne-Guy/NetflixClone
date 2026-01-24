import { create } from "zustand";
import type { Movie } from "@/typings";

type ModalStore = {
  isOpen: boolean;
  movie: Movie | null;
  open: (movie: Movie) => void;
  close: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  movie: null,
  open: (movie) => set({ isOpen: true, movie }),
  close: () => set({ isOpen: false }),
}));
