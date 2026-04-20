"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import {
  getBoardsApi,
  createBoardApi,
  joinBoardApi,
  deleteBoardApi,
} from "@/features/board/services/board.service";
import { Board } from "@/features/board/types";
import {
  Plus,
  LogOut,
  LinkIcon,
  Trash2,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTitle, setCreateTitle] = useState("");
  const [joinId, setJoinId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchBoards();
  }, [token]);

  const fetchBoards = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getBoardsApi(token);
      setBoards(data);
    } catch {
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !createTitle.trim()) return;
    try {
      await createBoardApi(token, createTitle.trim());
      setCreateTitle("");
      setShowCreate(false);
      fetchBoards();
    } catch {
      setError("Failed to create board");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !joinId.trim()) return;
    try {
      await joinBoardApi(token, joinId.trim());
      setJoinId("");
      setShowJoin(false);
      fetchBoards();
    } catch {
      setError("Failed to join board");
    }
  };

  const handleDelete = async (boardId: string) => {
    if (!token) return;
    try {
      await deleteBoardApi(token, boardId);
      fetchBoards();
    } catch {
      setError("Failed to delete board");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleBadge = (boardId: string) => {
    const member = boards
      .find((b) => b.id === boardId)
      ?.members.find((m) => m.userId === user?.id);
    if (!member) return null;
    const colors: Record<string, string> = {
      OWNER: "text-role-owner-text bg-role-owner-text/10",
      EDITOR: "text-role-editor-text bg-role-editor-text/10",
      VIEWER: "text-role-viewer-text bg-role-viewer-text/10",
    };
    return (
      <span
        className={`rounded-md px-2 py-0.5 text-xs font-medium ${colors[member.role]}`}
      >
        {member.role}
      </span>
    );
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-outline-variant bg-surface-container-low">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={24} className="text-primary" />
            <h1 className="text-xl font-semibold text-on-surface">
              SyncSpace
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-muted">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Actions */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowJoin(false);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
          >
            <Plus size={18} />
            New Board
          </button>
          <button
            onClick={() => {
              setShowJoin(!showJoin);
              setShowCreate(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <LinkIcon size={18} />
            Join Board
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-6 flex gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4"
          >
            <input
              type="text"
              required
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="Board title"
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary hover:bg-primary-container hover:text-on-primary-container"
            >
              Create
            </button>
          </form>
        )}

        {/* Join Form */}
        {showJoin && (
          <form
            onSubmit={handleJoin}
            className="mb-6 flex gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4"
          >
            <input
              type="text"
              required
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Paste board ID"
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-on-surface placeholder:text-on-surface-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-on-primary hover:bg-primary-container hover:text-on-primary-container"
            >
              Join
            </button>
          </form>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-error-container px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {/* Board List */}
        {loading ? (
          <p className="text-on-surface-muted">Loading boards...</p>
        ) : boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant py-16 text-center">
            <LayoutDashboard
              size={48}
              className="mb-4 text-on-surface-subtle"
            />
            <p className="text-lg text-on-surface-variant">No boards yet</p>
            <p className="text-sm text-on-surface-muted">
              Create a new board or join an existing one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative flex flex-col rounded-2xl border border-outline-variant bg-surface-container-low p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/20"
              >
                <button
                  onClick={() => router.push(`/board/${board.id}`)}
                  className="flex-1 text-left"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-medium text-on-surface">
                      {board.title}
                    </h3>
                    {getRoleBadge(board.id)}
                  </div>
                  <p className="text-xs text-on-surface-muted">
                    {board.members.length} member
                    {board.members.length !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-xs text-on-surface-subtle">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </button>

                {/* Copy ID & Delete */}
                <div className="mt-4 flex items-center gap-2 border-t border-outline-variant pt-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(board.id)}
                    title="Copy board ID"
                    className="rounded-lg px-2 py-1 text-xs text-on-surface-muted transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  >
                    Copy ID
                  </button>
                  {board.ownerId === user?.id && (
                    <button
                      onClick={() => handleDelete(board.id)}
                      title="Delete board"
                      className="ml-auto rounded-lg p-1.5 text-on-surface-muted transition-colors hover:bg-error-container hover:text-error"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
