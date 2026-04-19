"use client";

import { useWhiteboardStore } from "../store/whiteboard.store";

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

    return (
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        
        {/* Tools */}
        <button onClick={() => setTool("pen")}>✏️</button>
        <button onClick={() => setTool("rect")}>⬛</button>
        <button onClick={() => setTool("circle")}>⚪</button>
        <button onClick={() => setTool("select")}>🖱️</button>
        <button onClick={() => setTool("eraser")}>🩹</button>

        {/* Actions */}
        <button onClick={undo}>↩️</button>
        <button onClick={redo}>↪️</button>
        <button onClick={clear}>🧹</button>

        {/* Color */}
        <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
        />

        {/* Stroke */}
        <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />
        </div>
    );
}