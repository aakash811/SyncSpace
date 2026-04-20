"use client";

import { useAuthHydration } from "@/features/auth/hooks/useAuthStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useAuthHydration();

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}
