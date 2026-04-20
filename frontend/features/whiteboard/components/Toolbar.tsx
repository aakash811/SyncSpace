"use client";

import {
  Circle,
  Eraser,
  Minus,
  MousePointer2,
  Pen,
  Plus,
  Redo2,
  Square,
  Trash2,
  Undo2,
} from "lucide-react";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { useRef, useState } from "react";
import { Tool } from "../types";

const COLORS = [
  "#ffffff",
  "#cabeff",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#38bdf8",
  "#e879a0",
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8];

type ToolDef = { id: Tool; icon: React.ReactNode; label: string };

export default function Toolbar() {
  const {
    tool,
    setTool,
    undo,
    redo,
    clear,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
  } = useWhiteboardStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<HTMLDivElement>(null);

  const tools: ToolDef[] = [
    { id: "select", icon: <MousePointer2 size={20} />, label: "Select" },
    { id: "pen", icon: <Pen size={20} />, label: "Pen" },
    { id: "rect", icon: <Square size={20} />, label: "Rectangle" },
    { id: "circle", icon: <Circle size={20} />, label: "Circle" },
    { id: "eraser", icon: <Eraser size={20} />, label: "Eraser" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-2xl bg-surface-container-low border border-outline-variant px-2 py-1.5 shadow-lg shadow-black/40">
      {/* Drawing Tools */}
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={t.label}
          className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 cursor-pointer
            ${
              tool === t.id
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
        >
          {t.icon}
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-outline-variant mx-1" />

      {/* Color Picker */}
      <div className="relative" ref={colorRef}>
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowStrokePicker(false);
          }}
          title="Color"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 hover:bg-surface-container-high cursor-pointer"
        >
          <div
            className="w-5 h-5 rounded-full border-2 border-outline-variant"
            style={{ backgroundColor: color }}
          />
        </button>

        {showColorPicker && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-surface-container border border-outline-variant rounded-xl p-4 shadow-xl shadow-black/40 min-w-40">
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setShowColorPicker(false);
                  }}
                  className={`w-8 h-8 rounded-full transition-transform duration-100 hover:scale-110 cursor-pointer
                    ${
                      color === c
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container"
                        : "border border-outline-variant"
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stroke Width */}
      <div className="relative" ref={strokeRef}>
        <button
          onClick={() => {
            setShowStrokePicker(!showStrokePicker);
            setShowColorPicker(false);
          }}
          title="Stroke width"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
        >
          <div
            className="rounded-full bg-on-surface"
            style={{ width: Math.max(strokeWidth * 2.5, 6), height: Math.max(strokeWidth * 2.5, 6) }}
          />
        </button>

        {showStrokePicker && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-surface-container border border-outline-variant rounded-xl p-3 shadow-xl shadow-black/40">
            <div className="flex items-center gap-2">
              {STROKE_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setStrokeWidth(w);
                    setShowStrokePicker(false);
                  }}
                  title={`${w}px`}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-100 cursor-pointer
                    ${
                      strokeWidth === w
                        ? "bg-primary-container"
                        : "hover:bg-surface-container-high"
                    }`}
                >
                  <div
                    className="rounded-full bg-on-surface"
                    style={{ width: Math.max(w * 2.5, 4), height: Math.max(w * 2.5, 4) }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-outline-variant mx-1" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        title="Undo"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-on-surface-variant transition-all duration-150 hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
      >
        <Undo2 size={20} />
      </button>
      <button
        onClick={redo}
        title="Redo"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-on-surface-variant transition-all duration-150 hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
      >
        <Redo2 size={20} />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-outline-variant mx-1" />

      {/* Clear Canvas */}
      <button
        onClick={clear}
        title="Clear canvas"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-error transition-all duration-150 hover:bg-error-container hover:text-error cursor-pointer"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}