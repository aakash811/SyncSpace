"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";
import { User } from "../types";

type AuthState = {
  user: User | null;
  token: string | null;
  _hydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    set({ user, token, _hydrated: true });
  },

  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

/** Call this in a top-level client component to hydrate auth from localStorage */
export function useAuthHydration() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s._hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return hydrated;
}
