"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = usePregnancyData();
  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profileLoading && !profile?.onboardingCompletedAt) {
      router.replace("/onboarding");
    }
  }, [authLoading, profileLoading, user, profile, router]);

  if (loading || !user || !profile?.onboardingCompletedAt) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-3xl">🤰</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 overflow-y-auto pb-4">{children}</main>
      <BottomNav />
    </div>
  );
}
