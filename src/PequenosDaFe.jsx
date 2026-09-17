import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

// ─────────────────────────────────────────────
// Gate de acesso do produto "Pequenos da Fé Kids".
// Mesmo padrão de login/assinatura do MMA Field (src/App.jsx), mas
// consultando a tabela assinaturas_pequenos_da_fe (isolada de propósito).
// Ao confirmar assinatura ativa, redireciona para o app estático em
// /pequenos-da-fe/app/ (o jogo em si, fora do bundle React).
// ─────────────────────────────────────────────

const HC = "#6737d8";
const FUNDO = "linear-gradient(135deg,#6940df,#9658f0 55%,#4cbef4)";
const FONTE = "'Baloo 2','Trebuchet MS','Segoe UI',system-ui,sans-serif";

// TODO: troque pelos links reais de checkout do produto Pequenos da Fé na Kiwify.
const LINK_MENSAL = "https://pay.kiwify.com.br/SEU-LINK-PEQUENOS-DA-FE-MENSAL";
const LINK_ANUAL = "https://pay.kiwify.com.br/SEU-LINK-PEQUENOS-DA-FE-ANUAL";

function Carregando({ texto }) {
  return (
    <div style={{ minHeight: "100vh", background: FUNDO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTE }}>
      <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>🐑 {texto || "Carregando..."}</div>
    </div>
  );
}

function Marca() {
  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <div style={{ fontSize: 40 }}>🐑</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: HC }}>Arca <span style={{ color: "#f0a132" }}>Kids</span></div>
      <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginTop: 3, fontWeight: 700 }}>Brincando e aprendendo sobre o amor de Deus</div>
    </div>
  );
}

function AuthScreenPDF({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleLogin = async () => {
    setErro(""); setCarregando(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) { setErro("Email ou senha incorretos."); return; }
    onLogin(data.user);
  };

  const handleCadastro = async () => {
    setErro("");
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    setCarregando(true);
    const { error } = await supabase.auth.signUp({ email, password: senha });
    setCarregando(false);
    if (error) { setErro("Erro ao criar conta: " + error.message); return; }
    setSucesso("Conta criada! Verifique seu email para confirmar o cadastro.");
    setModo("login");
  };

  const handleEsqueci = async () => {
    setErro(""); setCarregando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/pequenos-da-fe" });
    setCarregando(false);
    if (error) { setErro("Erro ao enviar email."); return; }
    setSucesso("Email de recuperação enviado! Verifique sua caixa de entrada.");
  };

  const estiloInput = { width: "100%", padding: "11px 14px", border: "1.5px solid #e3d9fb", borderRadius: 12, fontSize: 14, fontFamily: FONTE, background: "#fbf9ff", boxSizing: "border-box", outline: "none", marginBottom: 12 };
  const estiloBotao = { width: "100%", padding: 13, background: "linear-gradient(135deg,#6737d8,#8c55ef)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 900, fontFamily: FONTE, cursor: "pointer", marginTop: 4 };
  const estiloLink = { background: "none", border: "none", color: "#6737d8", cursor: "pointer", fontSize: 12, fontFamily: FONTE, textDecoration: "underline", padding: 0 };

  return (
    <div style={{ minHeight: "100vh", background: FUNDO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTE, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <Marca />
        <div style={{ fontSize: 15, fontWeight: 900, color: HC, marginBottom: 18, textAlign: "center" }}>
          {modo === "login" && "Entrar na sua conta"}
          {modo === "cadastro" && "Criar nova conta"}
          {modo === "esqueci" && "Recuperar senha"}
        </div>
        {erro && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#b00000" }}>⚠️ {erro}</div>}
        {sucesso && <div style={{ background: "#f0fff4", border: "1px solid #a8e6c0", borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#1a5c35" }}>✅ {sucesso}</div>}
        <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={estiloInput} onKeyDown={e => e.key === "Enter" && modo === "login" && handleLogin()} />
        {modo !== "esqueci" && (
          <input type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} style={estiloInput} onKeyDown={e => e.key === "Enter" && modo === "login" && handleLogin()} />
        )}
        {modo === "cadastro" && (
          <input type="password" placeholder="Confirmar senha" value={confirmar} onChange={e => setConfirmar(e.target.value)} style={estiloInput} />
        )}
        <button onClick={modo === "login" ? handleLogin : modo === "cadastro" ? handleCadastro : handleEsqueci} disabled={carregando} style={{ ...estiloBotao, opacity: carregando ? 0.7 : 1 }}>
          {carregando ? "⏳ Aguarde..." : modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar Conta" : "Enviar Email de Recuperação"}
        </button>
        <div style={{ marginTop: 18, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          {modo === "login" && (
            <>
              <button onClick={() => { setModo("cadastro"); setErro(""); setSucesso(""); }} style={estiloLink}>Não tem conta? Criar conta</button>
              <button onClick={() => { setModo("esqueci"); setErro(""); setSucesso(""); }} style={{ ...estiloLink, color: "#888" }}>Esqueci minha senha</button>
            </>
          )}
          {(modo === "cadastro" || modo === "esqueci") && (
            <button onClick={() => { setModo("login"); setErro(""); setSucesso(""); }} style={estiloLink}>← Voltar para o login</button>
          )}
        </div>
      </div>
    </div>
  );
}

function NovaSenhaScreenPDF({ onConcluido }) {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const handleSalvar = async () => {
    setErro("");
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);
    if (error) { setErro("Erro ao atualizar senha. Tente novamente."); return; }
    setSucesso("Senha atualizada com sucesso!");
    setTimeout(() => onConcluido(), 1500);
  };
  const ei = { width: "100%", padding: "12px 14px", border: "1.5px solid #e3d9fb", borderRadius: 12, fontSize: 14, fontFamily: FONTE, background: "#fbf9ff", boxSizing: "border-box", marginBottom: 14, outline: "none" };
  return (
    <div style={{ minHeight: "100vh", background: FUNDO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTE, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <Marca />
        <div style={{ fontSize: 15, fontWeight: 900, color: HC, marginBottom: 18, textAlign: "center" }}>Defina sua nova senha</div>
        {erro && <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", color: "#b00000", padding: "10px 14px", borderRadius: 10, fontSize: 12, marginBottom: 14 }}>{erro}</div>}
        {sucesso && <div style={{ background: "#f0fff4", border: "1px solid #a8e6c0", color: "#1a5c35", padding: "10px 14px", borderRadius: 10, fontSize: 12, marginBottom: 14 }}>{sucesso}</div>}
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" style={ei} />
        <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="Repita a nova senha" style={ei} onKeyDown={e => e.key === "Enter" && handleSalvar()} />
        <button onClick={handleSalvar} disabled={carregando} style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#6737d8,#8c55ef)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 900, fontFamily: FONTE, cursor: "pointer", opacity: carregando ? 0.7 : 1 }}>
          {carregando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </div>
  );
}

function AssinaturaBloqueadaScreenPDF({ status, onLogout }) {
  const semLinha = !status;
  const ei = { display: "block", width: "100%", padding: 13, background: "linear-gradient(135deg,#6737d8,#8c55ef)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 900, fontFamily: FONTE, cursor: "pointer", textAlign: "center", textDecoration: "none", boxSizing: "border-box" };
  return (
    <div style={{ minHeight: "100vh", background: FUNDO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTE, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <Marca />
        {semLinha
          ? <div style={{ background: "#fff8d9", border: "1px solid #ffe17b", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#7a5c00", lineHeight: 1.5 }}>Ainda não encontramos seu pagamento. Se você acabou de assinar, aguarde alguns minutos e atualize a página.</div>
          : <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 12, padding: "14px 16px", marginBottom: 20, fontSize: 13, color: "#800000", lineHeight: 1.5 }}>Sua assinatura está com um pagamento pendente. Regularize para voltar a acessar o Arca Kids.</div>}
        <div style={{ fontSize: 12, color: "#555", marginBottom: 16, textAlign: "center" }}>Escolha um plano para continuar:</div>
        <a href={LINK_MENSAL} target="_blank" rel="noopener noreferrer" style={{ ...ei, marginBottom: 10, display: "block" }}>💳 Plano Mensal</a>
        <a href={LINK_ANUAL} target="_blank" rel="noopener noreferrer" style={{ ...ei, background: "linear-gradient(135deg,#f0a132,#f5c542)", color: "#5a3600", marginBottom: 20, display: "block" }}>👑 Plano Anual</a>
        <button onClick={onLogout} style={{ width: "100%", padding: 10, background: "none", border: "1px solid #ccc", borderRadius: 12, fontSize: 13, color: "#888", fontFamily: FONTE, cursor: "pointer" }}>Sair da conta</button>
      </div>
    </div>
  );
}

export default function PequenosDaFeApp() {
  const [user, setUser] = useState(null);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [statusAssinatura, setStatusAssinatura] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCarregandoAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setUser(session?.user ?? null);
        setModoRecuperacao(true);
      } else {
        setUser(session?.user ?? null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setStatusAssinatura(undefined); return; }
    setStatusAssinatura(undefined);
    supabase.from("assinaturas_pequenos_da_fe").select("status").eq("email", user.email).maybeSingle().then(({ data, error }) => {
      if (error) console.error("assinatura pequenos da fe:", error);
      setStatusAssinatura(data ? data.status : null);
    }).catch(() => setStatusAssinatura(null));
  }, [user]);

  useEffect(() => {
    if (statusAssinatura === "ativa") {
      // Assinatura confirmada: entra no app estático (o jogo em si), fora do bundle React.
      window.location.href = "/pequenos-da-fe/app/";
    }
  }, [statusAssinatura]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatusAssinatura(undefined);
  };

  if (carregandoAuth) return <Carregando texto="Carregando..." />;
  if (modoRecuperacao) return <NovaSenhaScreenPDF onConcluido={() => { setModoRecuperacao(false); setUser(null); }} />;
  if (!user) return <AuthScreenPDF onLogin={setUser} />;
  if (statusAssinatura === undefined) return <Carregando texto="Verificando assinatura..." />;
  if (statusAssinatura !== "ativa") return <AssinaturaBloqueadaScreenPDF status={statusAssinatura} onLogout={handleLogout} />;
  return <Carregando texto="Tudo certo! Entrando no app..." />;
}
