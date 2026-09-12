"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getRepo } from "../data/repo";
import { calculateFromDueDate, calculateFromLastPeriod, type PregnancyProgress } from "../pregnancy";
import type { PregnancyProfile } from "../types";

interface PregnancyData {
  loading: boolean;
  profile: PregnancyProfile | null;
  progress: PregnancyProgress | null;
  refresh: () => Promise<void>;
}

export function computeProgress(profile: PregnancyProfile | null): PregnancyProgress | null {
  if (!profile) return null;
  if (profile.dueDate) return calculateFromDueDate(profile.dueDate);
  if (profile.lastPeriodDate) return calculateFromLastPeriod(profile.lastPeriodDate);
  return null;
}

export function usePregnancyData(): PregnancyData {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PregnancyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getRepo().getProfile(user.id);
    setProfile(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados do usuário no mount
    refresh();
  }, [refresh]);

  return { loading, profile, progress: computeProgress(profile), refresh };
}
