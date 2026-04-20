"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import Whiteboard from "@/features/whiteboard/components/Whiteboard";
import Toolbar from "@/features/whiteboard/components/Toolbar";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  if (!token || !boardId) return null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface">
      <Toolbar />
      <Whiteboard boardId={boardId} />
    </div>
  );
}
