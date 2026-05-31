import React, { useState } from "react";

export default function Auth({ supabase }) {
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [erro, setErro]       = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo]       = useState("login");
  const [msg, setMsg]         = useState("");

  const entrar = async () => {
    if (!email || !senha) { setErro("Preencha email e senha."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) setErro("Email ou senha incorretos.");
    setLoading(false);
  };

  const recuperar = async () => {
    if (!email) { setErro("Digite seu email para recuperar a senha."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) setErro("Erro ao enviar email.");
    else setMsg("Email de recuperação enviado! Verifique sua caixa de entrada.");
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20}}>
      <div style={{background:"#fff",borderRadius:20,padding:"48px 40px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:52,marginBottom:12}}>🌿</div>
          <div style={{fontSize:24,fontWeight:"bold",color:"#1a3d2b",letterSpacing:0.5}}>MMA Field</div>
          <div style={{fontSize:13,color:"#888",marginTop:6,textTransform:"uppercase",letterSpacing:2}}>Meu Mundo Ambiental</div>
        </div>

        {msg ? (
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"16px 20px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:8}}>✅</div>
            <div style={{fontSize:13,color:"#166534"}}>{msg}</div>
            <button onClick={()=>{setMsg("");setModo("login");}} style={{marginTop:16,background:"#1a3d2b",color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:13}}>Voltar ao Login</button>
          </div>
        ) : (
          <div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:11,fontWeight:"bold",color:"#5a6b60",marginBottom:6,textTransform:"uppercase",letterSpacing:0.6}}>Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com" onKeyDown={e=>{if(e.key==="Enter")entrar();}} style={{width:"100%",padding:"12px 14px",border:"1px solid #cdd8d3",borderRadius:9,fontSize:14,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
            {modo==="login" && (
              <div style={{marginBottom:20}}>
                <label style={{display:"block",fontSize:11,fontWeight:"bold",color:"#5a6b60",marginBottom:6,textTransform:"uppercase",letterSpacing:0.6}}>Senha</label>
                <input value={senha} onChange={e=>setSenha(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e=>{if(e.key==="Enter")entrar();}} style={{width:"100%",padding:"12px 14px",border:"1px solid #cdd8d3",borderRadius:9,fontSize:14,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
            )}
            {erro && <div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#b91c1c",marginBottom:16}}>{erro}</div>}
            {modo==="login" ? (
              <div>
                <button onClick={entrar} disabled={loading} style={{width:"100%",background:loading?"#ccc":"linear-gradient(135deg,#1a3d2b,#2d6a4f)",color:"#fff",border:"none",borderRadius:10,padding:"14px",fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"Georgia,serif",fontWeight:"bold",marginBottom:14}}>
                  {loading?"Entrando...":"Entrar"}
                </button>
                <button onClick={()=>{setModo("recuperar");setErro("");}} style={{width:"100%",background:"none",border:"none",color:"#2d6a4f",fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",textDecoration:"underline"}}>Esqueci minha senha</button>
              </div>
            ) : (
              <div>
                <button onClick={recuperar} disabled={loading} style={{width:"100%",background:loading?"#ccc":"linear-gradient(135deg,#1a3d2b,#2d6a4f)",color:"#fff",border:"none",borderRadius:10,padding:"14px",fontSize:15,cursor:loading?"not-allowed":"pointer",fontFamily:"Georgia,serif",fontWeight:"bold",marginBottom:14}}>
                  {loading?"Enviando...":"Enviar Email de Recuperação"}
                </button>
                <button onClick={()=>{setModo("login");setErro("");}} style={{width:"100%",background:"none",border:"none",color:"#2d6a4f",fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",textDecoration:"underline"}}>Voltar ao Login</button>
              </div>
            )}
          </div>
        )}
        <div style={{textAlign:"center",marginTop:28,fontSize:11,color:"#aaa"}}>MMA Field © 2026 · Meu Mundo Ambiental</div>
      </div>
    </div>
  );
}
