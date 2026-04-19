"use client";

import { Stage, Layer, Rect, Line, Circle } from "react-konva";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { useSocketSync } from "../hooks/useSocketSync";
import { getSocket } from "@/lib/socket";
import { useState } from "react";
import { Shape } from "../types";
import { emit } from "process";

export default function Whiteboard() {
  const socket = getSocket();
  const boardId = "06d5d534-b31b-44f8-b914-13c5862d4b68";

  const shapes = useWhiteboardStore((state) => state.shapes);
  const tool = useWhiteboardStore((state) => state.tool);
  const color = useWhiteboardStore((state) => state.color);
  const strokeWidth = useWhiteboardStore((state) => state.strokeWidth);
  const setShapes = useWhiteboardStore((state) => state.setShapes);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{x: number, y: number} | null>(null);

  useSocketSync(boardId);

  let emitTimeout: any;
  const emitUpdate = (data: any) => {
    if (emitTimeout) return;

    emitTimeout = setTimeout(() => {
      socket.emit("STATE_UPDATE", data);
      emitTimeout = null;
    }, 50); // 20 FPS-ish
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

      const index = shapes.findIndex((shape, i) => {
        return clickedShape === e.target;
      })
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

    socket.emit("STATE_UPDATE", {
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
      width={800}
      height={500}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: "1px solid black" }}
    >
      <Layer>
        {shapes.map((shape: any, i: number) => {
          if(shape.tool === "pen") {
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
          if(shape.tool === "circle") {
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