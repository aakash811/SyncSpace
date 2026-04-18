export type Shape = 
| {
    tool: "rect", 
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}
| {
  tool: "pen",
  points: number[];
  stroke: string;
  strokeWidth: number;
}
| {
  tool: "circle",
  x: number;
  y: number;
  radius: number;
  fill: string;
}

export type BoardState = {
  shapes: Shape[];
};

export type Tool = "pen" | "rect" | "circle" | "select" | "eraser";