import { create } from "zustand";

type TextEditorState = {
  text: string;
  setText: (text: string) => void;
};

export const useTextEditorStore = create<TextEditorState>((set) => ({
  text: "",
  setText: (text) => set({ text }),
}));
