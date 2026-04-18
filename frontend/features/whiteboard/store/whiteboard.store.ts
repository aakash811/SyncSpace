import { create } from "zustand";
import { Shape, Tool } from "../types";

type WhiteboardState = {
  shapes: Shape[];
  tool: Tool;
  color: string;
  strokeWidth: number;

  history: Shape[][];
  future: Shape[][];

  setShapes: (shapes: Shape[]) => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  undo: () => void;
  redo: () => void;
  clear: () => void;
};

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  shapes: [],
  tool: "pen",
  color: "black",
  strokeWidth: 2,

  history: [],
  future: [],
  
  setShapes: (newShapes) => {
    const { shapes, history} = get();

    set({ 
      shapes: newShapes,
      history: [...history, shapes],
      future: [], 
    });
  },
  
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  undo: () => {
    const { history, shapes, future } = get();
    if(history.length === 0) return;

    const prev = history[history.length - 1];

    set({
      shapes: prev,
      history: history.slice(0, history.length - 1),
      future: [shapes, ...future],
    })
  },
  redo: () => {
    const { history, shapes, future } = get();
    if(future.length === 0) return;

    const next = future[0];

    set({
      shapes: next,
      future: future.slice(1),
      history: [...history, shapes],
    });
  },
  clear: () => {
    const { shapes, history } = get();
    set({
      shapes: [],
      history: [...history, shapes],
      future: [],
    });
  }
}));