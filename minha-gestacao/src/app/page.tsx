"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { usePregnancyData } from "@/lib/hooks/usePregnancyData";

export default function RootPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = usePregnancyData();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profileLoading) return;
    if (!profile?.onboardingCompletedAt) {
      router.replace("/onboarding");
      return;
    }
    router.replace("/today");
  }, [authLoading, profileLoading, user, profile, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="text-3xl">🤰</span>
    </div>
  );
}
