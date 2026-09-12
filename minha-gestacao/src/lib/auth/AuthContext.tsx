"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../supabase/config";
import { getSupabaseBrowserClient } from "../supabase/client";
import { demoSignIn, demoSignOut, demoSignUp, getCurrentDemoUser, type DemoUser } from "./local-auth";

export interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function fromDemoUser(user: DemoUser | null): AuthUser | null {
  return user ? { id: user.id, email: user.email } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const demoMode = !isSupabaseConfigured();
  const [user, setUser] = useState<AuthUser | null>(() => (demoMode ? fromDemoUser(getCurrentDemoUser()) : null));
  const [loading, setLoading] = useState(!demoMode);

  useEffect(() => {
    if (demoMode) return;
    let active = true;

    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (!active) return;
      const sessionUser = data.session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      const sessionUser = session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? null } : null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [demoMode]);

  async function signUp(email: string, password: string) {
    if (demoMode) {
      const demoUser = await demoSignUp(email, password);
      setUser(fromDemoUser(demoUser));
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) setUser({ id: data.user.id, email: data.user.email ?? null });
  }

  async function signIn(email: string, password: string) {
    if (demoMode) {
      const demoUser = await demoSignIn(email, password);
      setUser(fromDemoUser(demoUser));
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) setUser({ id: data.user.id, email: data.user.email ?? null });
  }

  async function signOut() {
    if (demoMode) {
      await demoSignOut();
      setUser(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode: demoMode, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
