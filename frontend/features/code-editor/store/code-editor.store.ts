import { create } from "zustand";
import { CodeLanguage } from "../types";

type CodeEditorState = {
  code: string;
  language: CodeLanguage;
  setCode: (code: string) => void;
  setLanguage: (language: CodeLanguage) => void;
  setCodeState: (code: string, language: CodeLanguage) => void;
};

export const useCodeEditorStore = create<CodeEditorState>((set) => ({
  code: "",
  language: "javascript",

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setCodeState: (code, language) => set({ code, language }),
}));
