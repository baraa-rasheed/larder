import { create } from "zustand";

export type Sheet =
  | { kind: "receipt" }
  | { kind: "recipe"; id: string }
  | { kind: "item"; id: string }
  | { kind: "add" }
  | null;

type UiState = {
  sheet: Sheet;
  note: string | null;
  open: (sheet: Exclude<Sheet, null>) => void;
  close: () => void;
  toast: (note: string) => void;
  clearNote: () => void;
};

export const useUi = create<UiState>((set) => ({
  sheet: null,
  note: null,
  open: (sheet) => set({ sheet }),
  close: () => set({ sheet: null }),
  toast: (note) => set({ note, sheet: null }),
  clearNote: () => set({ note: null }),
}));
