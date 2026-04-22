"use client";

import { Stage, Layer, Rect, Line, Circle, Text } from "react-konva";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { useSocketSync } from "../hooks/useSocketSync";
import { getSocket } from "@/lib/socket";
import { useState, useRef, useEffect } from "react";
import { Shape } from "../types";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { X } from "lucide-react";
import { usePresenceStore } from "@/features/board/store/presence.store";
import { getuserColor } from "@/features/board/utils/color";
import { emit } from "process";

export default function Whiteboard({ boardId }: { boardId: string }) {
  const { token, user } = useAuthStore();
  const socket = getSocket(token || undefined);
  const userId = user?.id || "unknown";

  const shapes = useWhiteboardStore((state) => state.shapes);
  const tool = useWhiteboardStore((state) => state.tool);
  const color = useWhiteboardStore((state) => state.color);
  const strokeWidth = useWhiteboardStore((state) => state.strokeWidth);
  const setShapes = useWhiteboardStore((state) => state.setShapes);
  const cursorsMap = usePresenceStore((state) => state.cursors);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  const emitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayRef = useRef<Record<string, { x: number; y: number }>>({});
  
  const cursorColor  = getuserColor(userId);
  const cursors = Object.values(cursorsMap);
  
  const emitCursor = (data: any) => {
    if(emitTimeoutRef.current) return;

    emitTimeoutRef.current = setTimeout(() => {
      socket.emit("CURSOR_MOVE", data);
      emitTimeoutRef.current = null;
    }, 30);
  };

  const lerp = (a: number, b: number, t: number) => {
    return a + (b - a) * t;
  };

  useSocketSync(boardId);

  useEffect(() => {
    const updateSize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      const next = { ...displayRef.current };
      Object.values(cursors).forEach((c: any) => {
        const prev = next[c.userId] || { x: c.x, y: c.y };
        next[c.userId] = {
          x: lerp(prev.x, c.x, 0.35),
          y: lerp(prev.y, c.y, 0.35),
        };
      });

      displayRef.current = next;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cursors]);

  const emitUpdate = (data: any) => {
    if (emitTimeoutRef.current) return;

    emitTimeoutRef.current = setTimeout(() => {
      socket.emit("STATE_UPDATE", data);
      emitTimeoutRef.current = null;
    }, 50);
  };

  // ✏️ START DRAWING
  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if(tool === "select"){
      return;
    }

    if(tool === "eraser"){
      const clickedShape = e.target;
      if (clickedShape === stage) return; // clicked on empty area

      const index = shapes.findIndex((_shape, i) => {
        return clickedShape === e.target;
      });

      if (index !== -1) {
        const updatedShapes = shapes.filter((_, i) => i !== index);
        setShapes(updatedShapes);
        emitUpdate({ boardId, state: { shapes: updatedShapes } });
      }
      return;
    }
    setIsDrawing(true);

    if(tool === "pen"){

      const newLine: Shape = {
        tool: "pen",
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: strokeWidth,
      };

      setShapes([...shapes, newLine]);
    }
      

    if(tool === "rect" || tool === "circle"){
      setStartPos({ x: pos.x, y: pos.y });

      const newShape: Shape = 
        tool === "rect" ? { 
          tool: "rect",
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: color,
        }:
        {
          tool: "circle",
          x: pos.x,
          y: pos.y,
          radius: 0,
          fill: color,
        };

        const updatedShapes = [...shapes, newShape];
        setShapes(updatedShapes);

      emitUpdate({
        boardId,
        state: {
          shapes: updatedShapes
        },
      });
    }
  };


  // ✏️ DRAWING IN PROGRESS
  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastShape = shapes[shapes.length - 1];
    if (!lastShape) return;

    //CURSOR SYNC
    emitCursor({
      boardId, 
      x: point.x,
      y: point.y,
      userId,
      name: user?.name,
      color: cursorColor,
    })

    //PEN TOOL
    if(tool === "pen" && lastShape.tool === "pen") {
      const updatedLine: Shape = {
        ...lastShape,
        points: [...lastShape.points, point.x, point.y],
      };
      
      const updatedShapes = [...shapes.slice(0, -1), updatedLine];
      setShapes(updatedShapes);
      return;
    }

    //RECTANGLE TOOL
    if(tool === "rect" && lastShape.tool === "rect" && startPos) {
      const updatedRect: Shape = {
        ...lastShape,
        width: point.x - startPos.x,
        height: point.y - startPos.y,
      };

      const updatedShapes = [...shapes.slice(0, -1), updatedRect];
      setShapes(updatedShapes);
      return;
    }

    //CIRCLE TOOL
    if(tool === "circle" && lastShape.tool === "circle" && startPos) {
      const radius = Math.sqrt(
        Math.pow(point.x - startPos.x, 2) + 
        Math.pow(point.y - startPos.y, 2)
      );

      const updatedCircle: Shape = {
        ...lastShape,
        radius,
      }

      const updatedShapes = [...shapes.slice(0, -1), updatedCircle];
      setShapes(updatedShapes);
      return;
    }
  };

  // ✏️ END DRAWING
  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);

    emitUpdate({
      boardId,
      state: { shapes },
    });
  };

  const handleDragEnd = (e: any, index: number) => {
    const {x, y} = e.target.position();

    const updatedShapes = shapes.map((shape, i) => {
      if(i !== index) return shape;

      return {
        ...shape,
        x, 
        y,
      };
    });

    setShapes(updatedShapes);

    emitUpdate({
      boardId,
      state: { shapes: updatedShapes},
    });
  };

  const handleErase = (index: number) => {
    if(tool !== "eraser"){
      return;
    }

    const updatedShapes = shapes.filter((_, i) => i !== index);

    setShapes(updatedShapes);

    emitUpdate({
      boardId,
      state: { shapes: updatedShapes},
    });
  };

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="cursor-crosshair"
    >
      <Layer>

        {Object.entries(displayRef.current).map(([uid, pos]) => {
          const user = cursors.find((c: any) => c.userId === uid);
          if (!user) return null;

          return (
            <>
              <Circle
                key={`dot-${uid}`}
                x={pos.x}
                y={pos.y}
                radius={4}
                fill={user.color}
              />
              <Text
                key={`label-${uid}`}
                x={pos.x + 8}
                y={pos.y + 8}
                text={user.name || uid.slice(0, 6)}
                fontSize={12}
                fill={user.color}
              />
            </>
          );
        })}

        {/* 🎨 Shapes */}
        {shapes.map((shape: any, i: number) => {
          if (shape.tool === "pen") {
            return (
              <Line
                key={i}
                points={shape.points}
                stroke={shape.stroke}
                strokeWidth={shape.strokeWidth}
                tension={0.5}
                lineCap="round"
                onClick={() => handleErase(i)}
              />
            );
          }

          if (shape.tool === "circle") {
            return (
              <Circle
                key={i}
                {...shape}
                draggable={tool === "select"}
                onDragEnd={(e) => handleDragEnd(e, i)}
                onClick={() => handleErase(i)}
              />
            );
          }

          return (
            <Rect
              key={i}
              {...shape}
              draggable={tool === "select"}
              onDragEnd={(e) => handleDragEnd(e, i)}
              onClick={() => handleErase(i)}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}