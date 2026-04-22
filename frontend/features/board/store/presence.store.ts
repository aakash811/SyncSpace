import {create} from "zustand";

type User = {
    userId: string;
    name?: string;
}

type Cursor = {
    userId: string,
    name?: string,
    color: string,
    x: number,
    y: number,
}

type PresenceState = {
    users: User[];
    cursors: Record<string, Cursor>;

    setUsers: (users: User[]) => void;
    upsertCursor: (cursor: Cursor) => void;
    removeCursor: (userId: string) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
    users: [],
    cursors: {},

    setUsers: (users) => set({users}),

    upsertCursor: (cursor) => set((state) => ({
        cursors: {...state.cursors, [cursor.userId] : cursor},
    })),

    removeCursor: (userId) => set((state) => {
        const next = {...state.cursors};
        delete next[userId];
        return {cursors: next};
    }),
}));