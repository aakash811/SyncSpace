"use client";

import Whiteboard from "@/features/whiteboard/components/Whiteboard";
import Toolbar from "@/features/whiteboard/components/Toolbar";

export default function Home() {
  return (
    <div>
      <h1>Whiteboard</h1>
      <Toolbar />
      <Whiteboard />
    </div>
  );
}