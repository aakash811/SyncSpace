"use client";

import { Stage, Layer, Rect, Line, Circle } from "react-konva";
import { useWhiteboardStore } from "../store/whiteboard.store";
import { useSocketSync } from "../hooks/useSocketSync";
import { getSocket } from "@/lib/socket";
import { useState } from "react";
import { Shape } from "../types";

export default function Whiteboard() {
  const socket = getSocket();
  const boardId = "06d5d534-b31b-44f8-b914-13c5862d4b68";

  const shapes = useWhiteboardStore((state) => state.shapes);
  const tool = useWhiteboardStore((state) => state.tool);
  const color = useWhiteboardStore((state) => state.color);
  const strokeWidth = useWhiteboardStore((state) => state.strokeWidth);
  const setShapes = useWhiteboardStore((state) => state.setShapes);

  const [isDrawing, setIsDrawing] = useState(false);

  useSocketSync(boardId);

  // ✏️ START DRAWING
  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if(tool === "pen"){
      setIsDrawing(true);

      const newLine: Shape = {
        tool: "pen",
        points: [pos.x, pos.y],
        stroke: color,
        strokeWidth: strokeWidth,
      };

      setShapes([...shapes, newLine]);
    }
      

    if(tool === "rect"){
      const newRect: Shape = {
        tool: "rect",
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        fill: color,
      };

      const updatedShapes = [...shapes, newRect];
      setShapes(updatedShapes);

      socket.emit("STATE_UPDATE", {
        boardId,
        state: {
          shapes: updatedShapes
        },
      });
    }

    if(tool === "circle"){
      const newCircle: Shape = {
        tool: "circle",
        x: pos.x,
        y: pos.y,
        radius: 50,
        fill: color,
      };

      const updatedShapes = [...shapes, newCircle];
      setShapes(updatedShapes);

      socket.emit("STATE_UPDATE", {
        boardId,
        state: {
          shapes: updatedShapes
        },
      });
    }
  };


  // ✏️ DRAWING IN PROGRESS
  const handleMouseMove = (e: any) => {
    if (!isDrawing || tool !== "pen") return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastShape = shapes[shapes.length - 1];
    if (!lastShape || lastShape.tool !== "pen") return;

    const updatedLine = {
      ...lastShape,
      points: [...lastShape.points, point.x, point.y],
    };

    const updatedShapes = [...shapes.slice(0, -1), updatedLine];

    setShapes(updatedShapes);

    socket.emit("STATE_UPDATE", {
      boardId,
      state: { shapes: updatedShapes },
    });
  };

  // ✏️ END DRAWING
  const handleMouseUp = () => {
    setIsDrawing(false);
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
              />
            );
          }
          if(shape.tool === "circle") {
            return <Circle key={i} {...shape} />
          }

          return <Rect key={i} {...shape} />
        })}
      </Layer>
    </Stage>
  );
}