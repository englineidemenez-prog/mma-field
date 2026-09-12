// Autenticação de demonstração, usada apenas quando o Supabase não está
// configurado. Guarda contas em localStorage só para permitir testar o fluxo
// completo do app localmente — nunca deve ser usada em produção.
import { readJSON, writeJSON, removeKey } from "../data/local-storage";

export interface DemoUser {
  id: string;
  email: string;
}

interface DemoAccount extends DemoUser {
  password: string;
}

function getAccounts(): DemoAccount[] {
  return readJSON<DemoAccount[]>("demo_accounts", []);
}

function saveAccounts(accounts: DemoAccount[]) {
  writeJSON("demo_accounts", accounts);
}

export function getCurrentDemoUser(): DemoUser | null {
  return readJSON<DemoUser | null>("demo_session", null);
}

function setSession(user: DemoUser | null) {
  if (user) writeJSON("demo_session", user);
  else removeKey("demo_session");
}

export async function demoSignUp(email: string, password: string): Promise<DemoUser> {
  const accounts = getAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Já existe uma conta com este e-mail.");
  }
  const user: DemoAccount = { id: crypto.randomUUID(), email, password };
  accounts.push(user);
  saveAccounts(accounts);
  setSession({ id: user.id, email: user.email });
  return { id: user.id, email: user.email };
}

export async function demoSignIn(email: string, password: string): Promise<DemoUser> {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!account || account.password !== password) {
    throw new Error("E-mail ou senha inválidos.");
  }
  setSession({ id: account.id, email: account.email });
  return { id: account.id, email: account.email };
}

export async function demoSignOut(): Promise<void> {
  setSession(null);
}
