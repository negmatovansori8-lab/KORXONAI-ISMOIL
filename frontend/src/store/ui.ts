import { create } from "zustand";

type UiState = {
  menu: boolean;
  setMenu: (v: boolean) => void;
  pdfUrl: string | null;
  pdfName: string;
  setPdf: (url: string | null, name?: string) => void;
};

export const useUi = create<UiState>((set) => ({
  menu: false,
  setMenu: (menu) => set({ menu }),
  pdfUrl: null,
  pdfName: "Hisobot.pdf",
  setPdf: (pdfUrl, pdfName = "Hisobot.pdf") => set({ pdfUrl, pdfName }),
}));
