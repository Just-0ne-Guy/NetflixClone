"use client";

import { RecoilRoot } from "recoil";
import { AuthProvider } from "../hooks/useAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RecoilRoot>
      <AuthProvider>{children}</AuthProvider>
    </RecoilRoot>
  );
}
