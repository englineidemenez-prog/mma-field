import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LabelList } from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: true, storageKey: "mmafield-auth" } }
);

const HC = "#1a3d2b";
const COR = ["#5a4fcf","#2d6a4f","#b5451b","#7d5a3c","#b08000","#0e6b7c","#c0622b","#8b5e1a","#6b4c9a","#6b7280","#e63946","#457b9d","#2a9d8f","#e9c46a","#f4a261","#264653","#6d6875","#b5838d","#3d405b","#81b29a","#118ab2","#06d6a0","#ef476f","#ffd166","#4cc9f0","#4361ee","#3a0ca3","#7209b7"];
const MPT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MSL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const ANS = ["2024","2025","2026","2027","2028"];
const PRG = [
  {id:"pac",      lb:"Programa Ambiental da Construção (PAC)",        cor:"#b08000", ic:"🏗️"},
  {id:"residuos", lb:"Gerenciamento de Resíduos Sólidos",             cor:"#5a4fcf", ic:"♻️"},
  {id:"efluentes",lb:"Gerenciamento de Efluentes Líquidos e Oleosos", cor:"#0e6b7c", ic:"🛢️"},
  {id:"erosao",   lb:"Controle de Processos Erosivos",                cor:"#7d5a3c", ic:"⛰️"},
  {id:"rad",      lb:"Recuperação de Áreas Degradadas (PRAD)",        cor:"#3a7c4e", ic:"🌱"},
  {id:"resgate",  lb:"Resgate de Fauna Silvestre",                    cor:"#c0622b", ic:"🐾"},
  {id:"supveg",   lb:"Programa de Supressão Vegetal",                 cor:"#8b5e1a", ic:"🪓"},
];
const SI  = {width:"100%",padding:"7px 10px",border:"1px solid #cdd8d3",borderRadius:7,fontSize:13,fontFamily:"Georgia,serif",background:"#fafdfb",boxSizing:"border-box",outline:"none"};
const LB  = {display:"block",fontSize:10,fontWeight:"bold",color:"#5a6b60",marginBottom:3,textTransform:"uppercase",letterSpacing:0.6};
const CD  = {background:"#fff",borderRadius:12,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.07)",border:"1px solid #e2ebe5",marginBottom:14};
const TH  = {color:"#fff",padding:"6px 9px",fontSize:11,textAlign:"left"};
const TD  = {padding:"5px 9px",fontSize:11,borderBottom:"1px solid #eee",verticalAlign:"top"};
const TA  = {padding:"5px 9px",fontSize:11,borderBottom:"1px solid #eee",verticalAlign:"top",background:"#f8fdf9"};
const SAVE_KEY = "mmafield_data";
const HIST_KEY = "mmafield_historico";
const INTRO_DEFAULT = "O presente relatório é referente ao atendimento dos Programas Ambientais do Plano Básico Ambiental (PBA), em conformidade com as condicionantes da Licença de Operação (LO) nº _______, emitida pelo órgão ambiental competente. As atividades descritas neste documento foram desenvolvidas no período de referência, visando o monitoramento, controle e mitigação dos impactos ambientais associados ao empreendimento.";


// ─────────────────────────────────────────────
// HOOK RESPONSIVO
// ─────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ─────────────────────────────────────────────
// BANNER DE INSTALAÇÃO PWA
// ─────────────────────────────────────────────
function BannerInstalar() {
  const [prompt, setPrompt] = useState(null);
  const [visivelMobile, setVisivelMobile] = useState(false);
  const [visivelDesktop, setVisivelDesktop] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      if (isMobileDevice) setVisivelMobile(true);
      else setVisivelDesktop(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setVisivelMobile(false);
      setVisivelDesktop(false);
      setInstalado(true);
    });
    if (!isMobileDevice) {
      setTimeout(() => setVisivelDesktop(true), 2000);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const instalar = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") { setVisivelMobile(false); setVisivelDesktop(false); }
    }
  };

  if (instalado) return null;

  if (visivelDesktop && !isMobileDevice) return (
    <div style={{position:"fixed",top:0,left:0,right:0,background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",zIndex:9999}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:24}}>🌿</span>
        <div>
          <div style={{color:"#fff",fontWeight:"bold",fontSize:13,fontFamily:"Georgia,serif"}}>💻 Instale o MMA Field no seu computador</div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontFamily:"Georgia,serif"}}>Clique no ícone ⊕ na barra de endereço do navegador, ou use o botão ao lado</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,flexShrink:0}}>
        <button onClick={()=>setVisivelDesktop(false)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.4)",color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12}}>Fechar</button>
        {prompt && <button onClick={instalar} style={{background:"#a8e6c0",border:"none",color:"#1a3d2b",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold"}}>⬇️ Baixar App</button>}
      </div>
    </div>
  );

  if (visivelMobile && isMobileDevice) return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 -4px 20px rgba(0,0,0,0.3)",zIndex:9999}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:32}}>🌿</span>
        <div>
          <div style={{color:"#fff",fontWeight:"bold",fontSize:14,fontFamily:"Georgia,serif"}}>Instale o MMA Field</div>
          <div style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontFamily:"Georgia,serif"}}>Acesso rápido na tela inicial do celular</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setVisivelMobile(false)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.4)",color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12}}>Agora não</button>
        <button onClick={instalar} style={{background:"#a8e6c0",border:"none",color:"#1a3d2b",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold"}}>📲 Instalar</button>
      </div>
    </div>
  );

  return null;
}

// ─────────────────────────────────────────────
// TELA DE AUTENTICAÇÃO
// ─────────────────────────────────────────────
function AuthScreen({ onLogin }) {
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
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    setCarregando(false);
    if (error) { setErro("Erro ao criar conta: " + error.message); return; }
    setSucesso("Conta criada! Verifique seu email para confirmar o cadastro.");
    setModo("login");
  };

  const handleEsqueci = async () => {
    setErro(""); setCarregando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setCarregando(false);
    if (error) { setErro("Erro ao enviar email."); return; }
    setSucesso("Email de recuperação enviado! Verifique sua caixa de entrada.");
  };

  const estiloFundo = {
    minHeight:"100vh",
    background:"linear-gradient(135deg,#1a3d2b 0%,#2d6a4f 50%,#1a3d2b 100%)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontFamily:"Georgia,serif",
    padding:20,
  };

  const estiloCard = {
    background:"#fff",
    borderRadius:18,
    padding:"40px 36px",
    width:"100%",
    maxWidth:420,
    boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
    overflow:"visible",
  };

  const estiloInput = {
    width:"100%",
    padding:"11px 14px",
    border:"1.5px solid #cdd8d3",
    borderRadius:9,
    fontSize:14,
    fontFamily:"Georgia,serif",
    background:"#fafdfb",
    boxSizing:"border-box",
    outline:"none",
    marginBottom:12,
    transition:"border-color 0.2s",
  };

  const estiloBotao = {
    width:"100%",
    padding:"13px",
    background:"linear-gradient(135deg,#2d6a4f,#1a3d2b)",
    color:"#fff",
    border:"none",
    borderRadius:9,
    fontSize:14,
    fontWeight:"bold",
    fontFamily:"Georgia,serif",
    cursor:"pointer",
    marginTop:4,
    letterSpacing:0.5,
  };

  const estiloLink = {
    background:"none",
    border:"none",
    color:"#2d6a4f",
    cursor:"pointer",
    fontSize:12,
    fontFamily:"Georgia,serif",
    textDecoration:"underline",
    padding:0,
  };

  return (
    <div style={estiloFundo}>
      <div style={estiloCard}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:42,marginBottom:8}}>🌿</div>
          <div style={{fontSize:22,fontWeight:"bold",color:HC,letterSpacing:1}}>MMA Field</div>
          <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:2,marginTop:3}}>Meu Mundo Ambiental</div>
        </div>

        <div style={{fontSize:15,fontWeight:"bold",color:HC,marginBottom:20,textAlign:"center"}}>
          {modo === "login" && "Entrar na sua conta"}
          {modo === "cadastro" && "Criar nova conta"}
          {modo === "esqueci" && "Recuperar senha"}
        </div>

        {erro && (
          <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#b00000"}}>
            ⚠️ {erro}
          </div>
        )}

        {sucesso && (
          <div style={{background:"#f0fff4",border:"1px solid #a8e6c0",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#1a5c35"}}>
            ✅ {sucesso}
          </div>
        )}

        <div>
          <label style={{...LB,marginBottom:5}}>Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            autoComplete="username"
            onChange={e => setEmail(e.target.value)}
            style={estiloInput}
            onKeyDown={e => e.key === "Enter" && modo === "login" && handleLogin()}
          />

          {modo !== "esqueci" && (
            <>
              <label style={{...LB,marginBottom:5}}>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                autoComplete="current-password"
                onChange={e => setSenha(e.target.value)}
                style={estiloInput}
                onKeyDown={e => e.key === "Enter" && modo === "login" && handleLogin()}
              />
            </>
          )}

          {modo === "cadastro" && (
            <>
              <label style={{...LB,marginBottom:5}}>Confirmar Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmar}
                autoComplete="new-password"
                onChange={e => setConfirmar(e.target.value)}
                style={estiloInput}
              />
            </>
          )}
        </div>

        <button
          onClick={modo === "login" ? handleLogin : modo === "cadastro" ? handleCadastro : handleEsqueci}
          disabled={carregando}
          style={{...estiloBotao, opacity: carregando ? 0.7 : 1}}
        >
          {carregando ? "⏳ Aguarde..." : modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar Conta" : "Enviar Email de Recuperação"}
        </button>

        <div style={{marginTop:16,textAlign:"center",display:"flex",flexDirection:"column",gap:10}}>
          {modo === "login" && (
            <>
              <button
                onClick={() => { setModo("cadastro"); setErro(""); setSucesso(""); }}
                style={{width:"100%",padding:"12px",background:"transparent",color:"#2d6a4f",border:"2px solid #2d6a4f",borderRadius:9,fontSize:14,fontWeight:"bold",fontFamily:"Georgia,serif",cursor:"pointer",letterSpacing:0.5}}
              >
                Criar nova conta
              </button>
              <button onClick={() => { setModo("esqueci"); setErro(""); setSucesso(""); }} style={{...estiloLink,color:"#888",marginTop:4}}>
                Esqueci minha senha
              </button>
            </>
          )}
          {(modo === "cadastro" || modo === "esqueci") && (
            <button onClick={() => { setModo("login"); setErro(""); setSucesso(""); }} style={estiloLink}>
              ← Voltar para o login
            </button>
          )}
        </div>

        <div style={{marginTop:24,textAlign:"center",fontSize:10,color:"#bbb"}}>
          MMA Field © 2026 · Meu Mundo Ambiental
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FUNÇÕES AUXILIARES
// ─────────────────────────────────────────────
function dlWord(mes, ano) {
  var el = document.getElementById("reldoc");
  if (!el) { alert("Abra a aba Relatório antes de baixar."); return; }
  var estilos = [
    "@page{size:A4 portrait;margin:2cm 3cm 2cm 3cm}",
    "body{font-family:Arial,sans-serif;font-size:11pt;color:#222;width:100%;margin:0;padding:0}",
    /* Cabeçalho como tabela */
    ".word-cab{width:100%;border-collapse:collapse;border-bottom:2px solid #1a3d2b;margin-bottom:10pt}",
    ".word-cab td{vertical-align:middle;padding:6pt 8pt}",
    ".word-cab .cab-centro{text-align:center;font-family:Arial,sans-serif;font-size:8pt;color:#444;line-height:1.6;font-weight:bold}",
    ".word-cab img{height:40pt;width:auto;max-width:80pt;object-fit:contain;display:block}",
    /* Capa */
    "#capa-rel{page-break-after:always;min-height:200mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}",
    /* Títulos padrão MRS */
    "h2{font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;text-transform:uppercase;text-align:justify;margin:18pt 0 6pt 0;page-break-after:avoid;border-bottom:2px solid currentColor;padding-bottom:4pt}",
    "h3{font-family:Arial,sans-serif;font-size:11pt;font-weight:bold;text-align:justify;margin:12pt 0 6pt 0;page-break-after:avoid}",
    "h4{font-family:Arial,sans-serif;font-size:11pt;font-weight:bold;text-align:justify;margin:8pt 0 4pt 0;page-break-after:avoid}",
    /* Texto */
    "p{font-family:Arial,sans-serif;font-size:11pt;line-height:16pt;text-align:justify;margin:6pt 0}",
    /* Tabelas padrão MRS */
    "table{width:100%;border-collapse:collapse;table-layout:fixed;word-wrap:break-word;font-family:Arial,sans-serif;font-size:9pt;margin:6pt 0}",
    "th{background:#4d4d4d;color:#fff;padding:4pt 6pt;font-size:9pt;font-weight:bold;text-align:center;border:0.5pt solid #999}",
    "td{padding:4pt 6pt;font-size:9pt;border:0.5pt solid #ccc;vertical-align:top;word-wrap:break-word;overflow-wrap:break-word}",
    "tr:nth-child(even) td{background:#f0f0f0}",
    /* Fotos */
    "img{max-width:100%;height:auto;display:block;margin:0 auto}",
    ".foto-tab{width:100%;border-collapse:collapse;margin:8pt 0}",
    ".foto-tab td{border:none;padding:4pt;text-align:center;vertical-align:top;width:50%}",
    ".foto-tab img{width:100%;max-height:55mm;object-fit:cover;border:1pt solid #ddd}",
    ".foto-leg{font-family:Arial,sans-serif;font-size:8pt;font-weight:bold;text-align:center;margin-top:3pt;color:#444}",
    ".foto-geo{font-family:Arial,sans-serif;font-size:7pt;color:#888;text-align:center}",
    /* Ocultar UI */
    "button,textarea,input,select,nav{display:none!important}",
    "svg,.recharts-wrapper{display:none!important}",
    /* Quebras */
    "h2,h3,h4{page-break-after:avoid}",
    ".prog-section{page-break-inside:avoid}",
  ].join("");

  // Clonar para não alterar o DOM
  var clone = el.cloneNode(true);

  // Substituir cabeçalho flex por tabela compatível
  var cabDiv = clone.firstElementChild;
  if (cabDiv) {
    var imgs = cabDiv.querySelectorAll("img");
    var centroDiv = cabDiv.querySelector("div[style*='textAlign:center'], div[style*='text-align:center']");
    var imgEsq = imgs[0] ? '<img src="'+imgs[0].src+'" style="height:40pt;width:auto;max-width:80pt;object-fit:contain"/>' : '<div style="width:80pt;height:40pt;background:#eee;display:inline-block"></div>';
    var imgDir = imgs[1] ? '<img src="'+imgs[1].src+'" style="height:40pt;width:auto;max-width:80pt;object-fit:contain"/>' : '<div style="width:80pt;height:40pt;background:#eee;display:inline-block"></div>';
    var centroHTML = centroDiv ? centroDiv.innerHTML : "";
    cabDiv.outerHTML = '<table class="word-cab"><tr>' +
      '<td style="width:110pt;text-align:left">'+imgEsq+'</td>' +
      '<td class="cab-centro">'+centroHTML+'</td>' +
      '<td style="width:110pt;text-align:right">'+imgDir+'</td>' +
      '</tr></table>';
  }

  // Converter grids de fotos em tabelas
  clone.querySelectorAll("div[style*='gridTemplateColumns']").forEach(function(grid) {
    var items = grid.children;
    var rows = "";
    for (var i = 0; i < items.length; i += 2) {
      var c1 = items[i], c2 = items[i+1];
      var celula = function(cel) {
        if (!cel) return '<td></td>';
        var img = cel.querySelector("img");
        var geo = cel.querySelector("div[style*='fontSize:8']");
        var leg = cel.querySelector("div[style*='fontSize:10']");
        return '<td style="width:50%;border:none;padding:4pt;text-align:center">' +
          (img ? '<img src="'+img.src+'" style="width:100%;max-height:80mm;object-fit:cover;border:1pt solid #ddd"/>' : '') +
          (geo ? '<div class="foto-geo">📍 '+geo.textContent+'</div>' : '') +
          (leg ? '<div class="foto-leg">'+leg.textContent+'</div>' : '') +
          '</td>';
      };
      rows += '<tr>'+celula(c1)+celula(c2)+'</tr>';
    }
    grid.outerHTML = '<table class="foto-tab"><tbody>'+rows+'</tbody></table>';
  });

  var conteudo = clone.innerHTML;
  var html = "\ufeff<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><meta name=ProgId content=Word.Document>" +
    "<style>"+estilos+"</style></head>" +
    "<body style='margin:0;padding:0'>"+conteudo+"</body></html>";
  var b = new Blob([html], {type:"application/vnd.ms-word;charset=utf-8"});
  var u = URL.createObjectURL(b);
  var a = document.createElement("a");
  a.href = u; a.download = "Relatorio_"+mes+"_"+ano+".doc"; a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); }, 3000);
}
function dlPDF() {
  var ob = String.fromCharCode(123), cb = String.fromCharCode(125);
  var s = document.createElement("style");
  s.id = "pprt";
  s.textContent =
    "@page" + ob + "size:A4 portrait;margin:2cm 2cm 2cm 3cm" + cb +
    "@media print" + ob +
      "body" + ob + "margin:0!important;padding:0!important;background:#fff!important;font-family:Arial,sans-serif!important" + cb +
      "body *" + ob + "visibility:hidden!important" + cb +
      "#reldoc,#reldoc *" + ob + "visibility:visible!important" + cb +
      "#reldoc" + ob +
        "position:static!important;" +
        "width:100%!important;max-width:100%!important;" +
        "box-shadow:none!important;border:none!important;" +
        "border-radius:0!important;padding:4mm 0!important;" +
        "margin:0!important;overflow:visible!important;background:#fff!important;" +
        "font-family:Arial,sans-serif!important;font-size:10pt!important" +
      cb +
      "#reldoc > div:first-child" + ob +
        "display:flex!important;flex-direction:row!important;" +
        "align-items:center!important;justify-content:space-between!important;" +
        "flex-wrap:nowrap!important;padding:6pt 0!important;" +
        "border-bottom:2pt solid #1a3d2b!important;margin-bottom:10pt!important" +
      cb +
      "#reldoc > div:first-child img" + ob +
        "height:45pt!important;width:auto!important;max-width:90pt!important;" +
        "object-fit:contain!important;flex-shrink:0!important;visibility:visible!important" +
      cb +
      "#reldoc > div:first-child > div" + ob +
        "flex:1!important;text-align:center!important;" +
        "font-family:Arial,sans-serif!important;font-size:8pt!important;font-weight:bold!important" +
      cb +
      "#capa-rel" + ob +
        "page-break-after:always!important;break-after:always!important;" +
        "display:flex!important;" +
        "flex-direction:column!important;justify-content:flex-end!important;align-items:center!important;padding-bottom:40mm!important" +
      cb +
      "h2" + ob +
        "font-family:Arial,sans-serif!important;font-size:11pt!important;" +
        "font-weight:bold!important;text-transform:uppercase!important;" +
        "page-break-after:avoid!important;break-after:avoid!important;margin:14pt 0 5pt 0!important" +
      cb +
      "h3,h4" + ob +
        "font-family:Arial,sans-serif!important;font-size:10pt!important;" +
        "page-break-after:avoid!important;break-after:avoid!important;margin:10pt 0 4pt 0!important" +
      cb +
      "p" + ob + "font-family:Arial,sans-serif!important;font-size:10pt!important;line-height:15pt!important;text-align:justify!important;margin:5pt 0!important" + cb +
      "table" + ob + "width:100%!important;border-collapse:collapse!important;table-layout:fixed!important;font-family:Arial,sans-serif!important;font-size:9pt!important;page-break-inside:avoid!important" + cb +
      "th" + ob + "background:#4d4d4d!important;color:#fff!important;padding:3pt 5pt!important;font-size:8pt!important;font-weight:bold!important;text-align:center!important" + cb +
      "td" + ob + "padding:3pt 5pt!important;font-size:8pt!important;border:0.5pt solid #ccc!important;word-wrap:break-word!important;overflow-wrap:break-word!important" + cb +
      "#reldoc div[style*='gridTemplateColumns']" + ob +
        "display:grid!important;grid-template-columns:1fr 1fr!important;gap:5mm!important;width:100%!important" +
      cb +
      "#reldoc img" + ob +
        "max-width:100%!important;max-height:60mm!important;" +
        "width:100%!important;height:auto!important;" +
        "object-fit:cover!important;display:block!important;page-break-inside:avoid!important" +
      cb +
      "button,input,select,nav,header" + ob + "display:none!important" + cb +
      "textarea" + ob + "border:none!important;resize:none!important;background:transparent!important" + cb +
      "button,input,select" + ob + "display:none!important" + cb +
    cb;
  document.head.appendChild(s);
  setTimeout(function() {
    window.print();
    setTimeout(function() { var x = document.getElementById("pprt"); if (x) x.remove(); }, 4000);
  }, 1000);
}
function estadoInicial() {
  try { var s = localStorage.getItem(SAVE_KEY); if (s) return JSON.parse(s); } catch(e) {}
  return null;
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCarregandoAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (carregandoAuth) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#fff",fontFamily:"Georgia,serif",fontSize:16}}>🌿 Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <><AuthScreen onLogin={setUser} /><BannerInstalar /></>;
  }

  return <><AppPrincipal user={user} onLogout={handleLogout} /><BannerInstalar /></>;
}

// ─────────────────────────────────────────────
// APP PRINCIPAL (conteúdo do app após login)
// ─────────────────────────────────────────────
function AppPrincipal({ user, onLogout }) {
  var ei = estadoInicial();
  const [aba, setAba]       = useState("fotos");
  const [fotos, setFotos]   = useState(ei?.fotos || {});
  const [psel, setPsel]     = useState("");
  const [leg, setLeg]       = useState("");
  const [dat, setDat]       = useState(new Date().toLocaleDateString("pt-BR"));
  const [prev, setPrev]     = useState(null);
  const [geo, setGeo]       = useState("");
  const [gst, setGst]       = useState("");
  const [dados, setDados]   = useState(ei?.dados || {});
  const [pd, setPd]         = useState("pac");
  const [inv, setInv]       = useState(ei?.inv || []);
  const [ldMTR, setLdMTR]   = useState(false);
  const [erMTR, setErMTR]   = useState("");
  const [cor, setCor]       = useState(ei?.cor || HC);
  const [lCons, setLCons]   = useState(ei?.lCons || null);
  const [lEmpr, setLEmpr]   = useState(ei?.lEmpr || null);
  const [campos, setCampos] = useState(ei?.campos || [
    {id:"f1",lb:"Empresa Executora",val:"",ed:false},
    {id:"f2",lb:"Empreendedor",val:"",ed:false},
    {id:"f3",lb:"Nome do Empreendimento",val:"",ed:false},
    {id:"f4",lb:"Estado (UF)",val:"",ed:false},
    {id:"f5",lb:"Responsável Técnico",val:"",ed:false},
  ]);
  const [nrel, setNrel]     = useState(ei?.nrel || "");
  const [mes, setMes]       = useState(ei?.mes || "Janeiro");
  const [ano, setAno]       = useState(ei?.ano || "2026");
  const [pAtiv, setPAtiv]   = useState(ei?.pAtiv || PRG.map(p => p.id));
  const [pCust, setPCust]   = useState(ei?.pCust || []);
  const [nomes, setNomes]   = useState(ei?.nomes || {});
  const [enome, setEnome]   = useState(null);
  const [extras, setExtras] = useState(ei?.extras || []);
  const [novo, setNovo]     = useState("");
  const [ger, setGer]       = useState(false);
  const [cfg, setCfg]       = useState(true);
  const [intro, setIntro]   = useState(ei?.intro || INTRO_DEFAULT);
  const [ident, setIdent]   = useState(ei?.ident || {
    empr_nome:"", empr_cnpj:"", empr_end:"", empr_tel:"", empr_rep:"", empr_contato:"", empr_email:"",
    cons_nome:"", cons_cnpj:"", cons_end:"", cons_tel:"", cons_rep:"", cons_contato:"", cons_email:""
  });
  const [equipe, setEquipe] = useState(ei?.equipe || []);
  const [historico, setHistorico] = useState(() => {
    try { var h = localStorage.getItem(HIST_KEY); return h ? JSON.parse(h) : []; } catch(e) { return []; }
  });
  const [msgSalvo, setMsgSalvo] = useState("");
  const ref = useRef();
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(function() {
      try {
        var estado = {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,ident,equipe};
        localStorage.setItem(SAVE_KEY, JSON.stringify(estado));
        setMsgSalvo("✅ Salvo automaticamente");
        setTimeout(function() { setMsgSalvo(""); }, 2000);
      } catch(e) {}
    }, 1500);
  }, [fotos,dados,inv,cor,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,ident,equipe]);
  const salvarRelatorio = () => {
    var rel = {
      id: Date.now(), mes, ano, nrel,
      titulo: (nrel?nrel+"º ":"")+"Relatório – "+mes+"/"+ano,
      empresa: campos.find(c=>c.id==="f1")?.val||"",
      empreendimento: campos.find(c=>c.id==="f3")?.val||"",
      data: new Date().toLocaleDateString("pt-BR"),
      estado: {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,ident,equipe}
    };
    var nh = [rel,...historico];
    setHistorico(nh);
    try { localStorage.setItem(HIST_KEY, JSON.stringify(nh)); } catch(e) {}
    alert("Relatório de "+mes+"/"+ano+" salvo no histórico!");
  };
  const carregarRelatorio = (rel) => {
    var e = rel.estado;
    setFotos(e.fotos||{}); setDados(e.dados||{}); setInv(e.inv||[]);
    setCor(e.cor||HC); setLCons(e.lCons||null); setLEmpr(e.lEmpr||null);
    setCampos(e.campos||[]); setNrel(e.nrel||""); setMes(e.mes||"Janeiro");
    setAno(e.ano||"2026"); setPAtiv(e.pAtiv||PRG.map(p=>p.id));
    setPCust(e.pCust||[]); setNomes(e.nomes||{}); setExtras(e.extras||[]);
    setIntro(e.intro||INTRO_DEFAULT);
    setAba("relatorio");
    alert("Relatório de "+rel.mes+"/"+rel.ano+" carregado!");
  };
  const excluirRelatorio = (id) => {
    if (!window.confirm("Excluir este relatório?")) return;
    var nh = historico.filter(r=>r.id!==id);
    setHistorico(nh);
    try { localStorage.setItem(HIST_KEY, JSON.stringify(nh)); } catch(e) {}
  };
  const baixarRelatorio = (rel) => {
    carregarRelatorio(rel);
    setTimeout(function() {
      setAba("relatorio");
      setTimeout(function() { dlWord(rel.mes, rel.ano); }, 1500);
    }, 600);
  };
  const novoRelatorio = () => {
    if (!window.confirm("Iniciar novo relatório?")) return;
    setFotos({}); setDados({}); setInv([]); setCor(HC); setLCons(null); setLEmpr(null);
    setCampos([{id:"f1",lb:"Empresa Executora",val:"",ed:false},{id:"f2",lb:"Empreendedor",val:"",ed:false},{id:"f3",lb:"Nome do Empreendimento",val:"",ed:false},{id:"f4",lb:"Estado (UF)",val:"",ed:false},{id:"f5",lb:"Responsável Técnico",val:"",ed:false}]);
    setNrel(""); setMes("Janeiro"); setAno("2026"); setPAtiv(PRG.map(p=>p.id));
    setPCust([]); setNomes({}); setExtras([]); setIntro(INTRO_DEFAULT);
    setIdent({empr_nome:"",empr_cnpj:"",empr_end:"",empr_tel:"",empr_rep:"",empr_contato:"",empr_email:"",cons_nome:"",cons_cnpj:"",cons_end:"",cons_tel:"",cons_rep:"",cons_contato:"",cons_email:""});
    setEquipe([]); setAba("fotos");
  };
  const isMobile = useIsMobile();
  const todos  = [...PRG,...pCust];
  const ativos = todos.filter(p=>pAtiv.includes(p.id));
  const getL   = id => nomes[id]||todos.find(p=>p.id===id)?.lb||id;
  const numR   = nrel ? nrel.replace(/º/gi,"")+"º" : "Nº";
  const nEmp   = campos.find(c=>c.id==="f3")?.val||"";
  const emp    = campos.find(c=>c.id==="f1")?.val||"";
  const updC   = (id,p) => setCampos(cs=>cs.map(c=>c.id===id?{...c,...p}:c));
  const setLogo= (fn,f) => { var r=new FileReader(); r.onload=e=>fn(e.target.result); r.readAsDataURL(f); };
  const getD   = id => dados[id]||{desc:"",graficos:[],cor:PRG.find(p=>p.id===id)?.cor||"#2d6a4f"};
  const setD   = (id,p) => setDados(d=>({...d,[id]:{...getD(id),...p}}));
  const getF   = id => fotos[id]||[];
  const captGeo = () => {
    if (!navigator.geolocation) { setGst("GPS indisponível."); return; }
    setGst("📡 Obtendo localização...");
    navigator.geolocation.getCurrentPosition(
      p=>{setGeo(p.coords.latitude.toFixed(6)+", "+p.coords.longitude.toFixed(6)+" (±"+Math.round(p.coords.accuracy)+"m)");setGst("✅ Localização obtida");},
      e=>setGst("❌ "+e.message),{enableHighAccuracy:true,timeout:10000}
    );
  };
  const onFoto = e => {
    var f=e.target.files[0]; if(!f) return;
    var r=new FileReader(); r.onload=ev=>setPrev(ev.target.result); r.readAsDataURL(f);
    if(navigator.geolocation){setGst("📡 Obtendo localização...");navigator.geolocation.getCurrentPosition(p=>{setGeo(p.coords.latitude.toFixed(6)+", "+p.coords.longitude.toFixed(6)+" (±"+Math.round(p.coords.accuracy)+"m)");setGst("✅ Localização obtida");},()=>setGst(""),{enableHighAccuracy:true,timeout:8000});}
  };
  const addF = () => {
    if(!prev||!psel) return;
    setFotos(f=>({...f,[psel]:[...(f[psel]||[]),{id:Date.now(),src:prev,leg,dat,geo}]}));
    setPrev(null);setLeg("");setGeo("");setGst("");
    if(ref.current) ref.current.value="";
  };
  const remF = (pid,fid) => setFotos(f=>({...f,[pid]:(f[pid]||[]).filter(x=>x.id!==fid)}));
  const lerMTR = async arq => {
    setLdMTR(true); setErMTR("");
    try {
      var b64 = await new Promise(function(res,rej){var r=new FileReader();r.onload=function(e){res(e.target.result.split(",")[1]);};r.onerror=function(){rej(new Error("Falha"));};r.readAsDataURL(arq);});
      var pt = "Analise este MTR ou CDF. Retorne APENAS JSON com: tipo_doc, numero, data_emissao, classe, tipo_residuo, volume, unidade, transportador, destinador, tratamento";
      var mc = arq.type==="application/pdf"?[{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},{type:"text",text:pt}]:[{type:"image",source:{type:"base64",media_type:arq.type,data:b64}},{type:"text",text:pt}];
      var rs = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:mc}]})});
      var j = await rs.json();
      var raw=(j.content||[]).map(function(c){return c.text||"";}).join("").trim();
      var si=raw.indexOf("{"),ei=raw.lastIndexOf("}");
      var p2=JSON.parse(si>=0?raw.slice(si,ei+1):raw);
      setInv(function(prev){return [...prev,{id:Date.now(),ed:false,tipo_doc:p2.tipo_doc||"MTR",numero:p2.numero||"",data:p2.data_emissao||"",classe:p2.classe||"",tipo_residuo:p2.tipo_residuo||"",volume:p2.volume||"",unidade:p2.unidade||"t",transportador:p2.transportador||"",destinador:p2.destinador||"",tratamento:p2.tratamento||""}];});
    } catch(e){setErMTR("Erro: "+e.message);}
    setLdMTR(false);
  };
  const addExtra = async () => {
    if(!novo.trim()) return; setGer(true);
    try {
      var rs=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:"Escreva um parágrafo técnico introdutório (max 4 linhas) para o programa ambiental "+novo+" de um PBA. Retorne APENAS o parágrafo."}]})});
      var j=await rs.json();
      var txt=(j.content||[]).map(function(c){return c.text||"";}).join("").trim();
      setExtras(function(prev){return [...prev,{id:"e"+Date.now(),nome:novo.trim(),intro:txt}];});
      setNovo("");
    }catch(e){}
    setGer(false);
  };
  const Cab = () => (
    <div style={{borderBottom:"2px solid "+HC,padding:"8px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#fafdfb"}}>
      {lCons?<img src={lCons} alt="" style={{height:60,objectFit:"contain"}}/>:<div style={{width:110,height:60,background:"#eee",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#aaa"}}>Logo</div>}
      <div style={{textAlign:"center",fontSize:9,color:"#444",lineHeight:1.7}}>
        <strong>{numR} RELATÓRIO – {mes.toUpperCase()}/{ano}</strong><br/>GESTÃO E SUPERVISÃO AMBIENTAL<br/>{nEmp||"—"}
      </div>
      {lEmpr?<img src={lEmpr} alt="" style={{height:60,objectFit:"contain"}}/>:<div style={{width:110,height:60,background:"#eee",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#aaa"}}>Logo</div>}
    </div>
  );
  const renderGrafico = (gr, height, forReport) => {
    var gd2=(gr.dados||[]).filter(x=>x.l&&x.v);
    if(gd2.length===0) return null;
    var chartData = gd2.map(g=>({name:g.l,val:Number(g.v),fill:g.cor||gr.cor||"#2d6a4f"}));
    return (
      <ResponsiveContainer width="100%" height={height||200}>
        {gr.tipo==="pizza"
          ?<PieChart><Pie data={chartData.map(d=>({name:d.name,value:d.val}))} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({name,value,percent})=>name+": "+value+(gr.unidade?" "+gr.unidade:"")+" ("+(percent*100).toFixed(0)+"%)"}>{chartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Pie><Tooltip formatter={(v,n)=>[v+(gr.unidade?" "+gr.unidade:""),n]}/></PieChart>
          :<BarChart data={chartData} margin={{top:20,right:10,left:0,bottom:chartData.length>4?45:10}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:9}} angle={chartData.length>4?-35:0} textAnchor={chartData.length>4?"end":"middle"} interval={0}/>
            <YAxis tick={{fontSize:9}} unit={gr.unidade?" "+gr.unidade:""}/>
            <Tooltip formatter={v=>[v+(gr.unidade?" "+gr.unidade:""),"Valor"]}/>
            <Bar dataKey="val" radius={[4,4,0,0]} maxBarSize={60}>
              {chartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
              <LabelList dataKey="val" position="top" style={{fontSize:10,fontWeight:"bold"}} formatter={v=>v+(gr.unidade?" "+gr.unidade:"")}/>
            </Bar>
          </BarChart>}
      </ResponsiveContainer>
    );
  };
  const ABS = [{id:"fotos",lb:"📷 Registro Fotográfico"},{id:"dados",lb:"📊 Dados"},{id:"config",lb:"⚙️ Configurar"},{id:"relatorio",lb:"📄 Relatório"},{id:"historico",lb:"📁 Histórico"}];
  return (
    <div style={{minHeight:"100vh",background:"#eef1ee",fontFamily:"Georgia,serif"}}>
      <header style={{background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",boxShadow:"0 3px 16px rgba(0,0,0,0.25)"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:26}}>🌿</span>
            <div>
              <div style={{fontSize:17,fontWeight:"bold",color:"#fff",letterSpacing:0.8}}>MMA Field</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:2}}>Meu Mundo Ambiental</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {msgSalvo&&<span style={{fontSize:11,color:"#a8e6c0",fontStyle:"italic"}}>{msgSalvo}</span>}
            <span style={{fontSize:11,color:"rgba(255,255,255,0.6)",display:isMobile?"none":"inline"}}>👤 {user.email}</span>
            <button onClick={salvarRelatorio} style={{background:"#2d6a4f",color:"#fff",border:"2px solid #a8e6c0",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>💾 Salvar Relatório</button>
            <button onClick={novoRelatorio} style={{background:"transparent",color:"#fff",border:"2px solid rgba(255,255,255,0.4)",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12}}>+ Novo</button>
            <button onClick={onLogout} style={{background:"transparent",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11}}>Sair</button>
          </div>
        </div>
        <nav style={{maxWidth:1100,margin:"0 auto",display:"flex",paddingLeft:isMobile?4:18,flexWrap:"wrap"}}>
          {ABS.map(t=>(
            <button key={t.id} onClick={()=>setAba(t.id)} style={{background:aba===t.id?"#eef1ee":"transparent",color:aba===t.id?HC:"rgba(255,255,255,0.85)",border:"none",padding:"9px 20px",borderRadius:"8px 8px 0 0",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:aba===t.id?"bold":"normal"}}>
              {t.lb}
            </button>
          ))}
        </nav>
      </header>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"20px"}}>
        {/* FOTOS */}
        {aba==="fotos"&&(
          <div>
            <h2 style={{color:HC,marginBottom:18}}>📷 Registro Fotográfico</h2>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"380px 1fr",gap:18,alignItems:"start"}}>
              <div style={CD}>
                <h3 style={{color:"#2d6a4f",marginBottom:14,fontSize:14}}>Nova Foto</h3>
                <label style={LB}>Data</label>
                <input value={dat} onChange={e=>setDat(e.target.value)} style={{...SI,marginBottom:12}}/>
                <label style={LB}>Programa</label>
                <select value={psel} onChange={e=>setPsel(e.target.value)} style={{...SI,marginBottom:12}}>
                  <option value="">Selecione...</option>
                  {ativos.map(p=><option key={p.id} value={p.id}>{p.ic} {getL(p.id)}</option>)}
                </select>
                <label style={LB}>Foto</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:8}}>
                  <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"14px 8px",border:"2px dashed #a8c5b5",borderRadius:10,cursor:"pointer",background:"#f8fdf9"}}>
                    <span style={{fontSize:22}}>📷</span><span style={{fontSize:11,color:"#2d6a4f",fontWeight:"bold"}}>Câmera</span><span style={{fontSize:10,color:"#888"}}>Com GPS automático</span>
                    <input ref={ref} type="file" accept="image/*" capture="environment" onChange={onFoto} style={{display:"none"}}/>
                  </label>
                  <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"14px 8px",border:"2px dashed #a8c5b5",borderRadius:10,cursor:"pointer",background:"#f8fdf9"}}>
                    <span style={{fontSize:22}}>🖼️</span><span style={{fontSize:11,color:"#2d6a4f",fontWeight:"bold"}}>Galeria</span><span style={{fontSize:10,color:"#888"}}>Selecionar arquivo</span>
                    <input type="file" accept="image/*" onChange={onFoto} style={{display:"none"}}/>
                  </label>
                </div>
                {prev&&<img src={prev} alt="" style={{width:"100%",height:150,objectFit:"cover",borderRadius:9,border:"2px solid #2d6a4f",marginBottom:10}}/>}
                <div style={{marginBottom:10,padding:"9px 11px",borderRadius:8,border:"1px solid #c8ddd2",background:"#f5fdf7"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,fontWeight:"bold",color:"#2d6a4f"}}>📍 Geolocalização</div>
                    <button onClick={captGeo} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10}}>Capturar GPS</button>
                  </div>
                  {gst&&<div style={{fontSize:10,color:"#666",marginTop:3}}>{gst}</div>}
                  {geo&&<div style={{fontSize:10,color:"#2d6a4f",marginTop:4,background:"#e8f5ee",padding:"4px 8px",borderRadius:5}}>{geo}</div>}
                  {!geo&&!gst&&<div style={{fontSize:10,color:"#aaa",marginTop:3}}>GPS capturado automaticamente ao tirar foto.</div>}
                </div>
                <label style={LB}>Legenda</label>
                <input value={leg} onChange={e=>setLeg(e.target.value)} placeholder="Descreva a foto..." style={{...SI,marginBottom:14}}/>
                <button onClick={addF} disabled={!prev||!psel} style={{background:!prev||!psel?"#ccc":"linear-gradient(135deg,#2d6a4f,#1a3d2b)",color:"#fff",border:"none",borderRadius:8,padding:"10px",width:"100%",fontSize:13,cursor:!prev||!psel?"not-allowed":"pointer",fontFamily:"Georgia,serif",fontWeight:"bold"}}>✓ Adicionar Foto</button>
              </div>
              <div>
                {ativos.filter(p=>getF(p.id).length>0).length===0
                  ?<div style={{...CD,textAlign:"center",padding:"48px 20px",color:"#aaa"}}><div style={{fontSize:44,marginBottom:10}}>📷</div><div style={{fontSize:14,fontWeight:"bold",color:"#2d6a4f"}}>Nenhuma foto registrada</div></div>
                  :ativos.filter(p=>getF(p.id).length>0).map(p=>(
                    <div key={p.id} style={{...CD,border:"1px solid "+p.cor+"44"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                        <span style={{fontSize:18}}>{p.ic}</span>
                        <div style={{fontWeight:"bold",color:p.cor,fontSize:13}}>{getL(p.id)}</div>
                        <span style={{fontSize:11,color:"#888",marginLeft:"auto"}}>{getF(p.id).length} foto(s)</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:9}}>
                        {getF(p.id).map((f,fi)=>(
                          <div key={f.id} style={{borderRadius:9,overflow:"hidden",border:"1px solid #e0ebe5",position:"relative"}}>
                            <img src={f.src} alt={f.leg} style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/>
                            <div style={{padding:"6px 8px",background:"#fafafa"}}>
                              <div style={{fontSize:9,color:"#888"}}>{f.dat}</div>
                              {f.geo&&<div style={{fontSize:8,color:"#2d6a4f"}}>📍 {f.geo}</div>}
                              <div style={{fontSize:10,color:"#333"}}>Foto {fi+1}{f.leg?" – "+f.leg:""}</div>
                            </div>
                            <button onClick={()=>remF(p.id,f.id)} style={{position:"absolute",top:4,right:4,background:"rgba(170,0,0,0.85)",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:11}}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
        {/* DADOS */}
        {aba==="dados"&&(
          <div>
            <h2 style={{color:HC,marginBottom:14}}>📊 Dados e Indicadores</h2>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {ativos.map(p=>(
                <button key={p.id} onClick={()=>setPd(p.id)} style={{background:pd===p.id?p.cor:"#fff",color:pd===p.id?"#fff":"#333",border:"2px solid "+(pd===p.id?p.cor:"#ddd"),borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11}}>
                  {p.ic} {getL(p.id).split("(")[0].trim().replace("Programa de ","").replace("Programa ","").trim()}
                </button>
              ))}
            </div>
            {(()=>{
              var p=todos.find(x=>x.id===pd); if(!p) return null;
              var d=getD(pd); var set=patch=>setD(pd,patch);
              return (
                <div>
                  <div style={CD}>
                    <h3 style={{color:p.cor,marginBottom:10,fontSize:13}}>{p.ic} {getL(p.id)}</h3>
                    <label style={LB}>Descrição das Atividades</label>
                    <textarea value={d.desc||""} onChange={e=>set({desc:e.target.value})} rows={4} style={{...SI,resize:"vertical"}} placeholder="Descreva as atividades realizadas no período..."/>
                  </div>
                  {pd==="residuos"&&(
                    <div>
                      <div style={{...CD,border:"2px solid #5a4fcf33",background:"linear-gradient(135deg,#faf9ff,#f3f0ff)"}}>
                        <div style={{fontSize:13,fontWeight:"bold",color:"#5a4fcf",marginBottom:8}}>🤖 Leitura Automática de MTR / CDF</div>
                        <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px",border:"2px dashed #5a4fcf88",borderRadius:12,cursor:"pointer",background:"#fff",maxWidth:380}}>
                          <span style={{fontSize:28}}>📄</span>
                          <span style={{fontWeight:"bold",color:"#5a4fcf",fontSize:12}}>Selecionar MTR ou CDF (PDF ou imagem)</span>
                          <input type="file" accept=".pdf,image/*" multiple style={{display:"none"}} onChange={async e=>{for(var f of Array.from(e.target.files))await lerMTR(f);e.target.value="";}}/>
                          {ldMTR&&<span style={{fontSize:11,color:"#5a4fcf"}}>⏳ Lendo documento...</span>}
                        </label>
                        {erMTR&&<div style={{marginTop:8,padding:"6px 10px",background:"#fff0f0",borderRadius:7,fontSize:11,color:"#b00"}}>{erMTR}</div>}
                      </div>
                      <div style={CD}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <h3 style={{color:"#5a4fcf",fontSize:13,margin:0}}>📋 Inventário de Resíduos</h3>
                          <span style={{fontSize:11,color:"#888"}}>{inv.length} registro(s)</span>
                        </div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,minWidth:860}}>
                            <thead><tr>{["Doc","Número","Data","Classe","Tipo","Volume","Unidade","Transportador","Destinador","Tratamento",""].map((h,i)=><th key={i} style={{...TH,background:"#5a4fcf",padding:"6px 7px",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                            <tbody>
                              {inv.length===0&&<tr><td colSpan={11} style={{...TD,textAlign:"center",color:"#ccc",padding:"20px",fontStyle:"italic"}}>Nenhum registro</td></tr>}
                              {inv.map((row,i)=>(
                                <tr key={row.id}>
                                  {row.ed?(
                                    <>{["tipo_doc","numero","data","classe","tipo_residuo","volume"].map(f=>(
                                      <td key={f} style={{...TD,background:"#faf9ff",padding:"3px 4px"}}><input value={row[f]||""} onChange={e=>setInv(prev=>prev.map((r,j)=>j===i?{...r,[f]:e.target.value}:r))} style={{width:"100%",minWidth:55,padding:"2px 4px",border:"1px solid #5a4fcf",borderRadius:4,fontSize:10,fontFamily:"Georgia,serif"}}/></td>
                                    ))}
                                    <td style={{...TD,background:"#faf9ff",padding:"3px 4px"}}>
                                      <select value={row.unidade||"t"} onChange={e=>setInv(prev=>prev.map((r,j)=>j===i?{...r,unidade:e.target.value}:r))} style={{width:"100%",padding:"2px 4px",border:"1px solid #5a4fcf",borderRadius:4,fontSize:10,fontFamily:"Georgia,serif"}}>
                                        <option value="kg">kg</option><option value="t">t</option><option value="m3">m³</option><option value="un">un</option>
                                      </select>
                                    </td>
                                    {["transportador","destinador","tratamento"].map(f=>(
                                      <td key={f} style={{...TD,background:"#faf9ff",padding:"3px 4px"}}><input value={row[f]||""} onChange={e=>setInv(prev=>prev.map((r,j)=>j===i?{...r,[f]:e.target.value}:r))} style={{width:"100%",minWidth:55,padding:"2px 4px",border:"1px solid #5a4fcf",borderRadius:4,fontSize:10,fontFamily:"Georgia,serif"}}/></td>
                                    ))}
                                    <td style={{...TD,background:"#faf9ff"}}><div style={{display:"flex",gap:3}}><button onClick={()=>setInv(prev=>prev.map((r,j)=>j===i?{...r,ed:false}:r))} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10}}>✓</button><button onClick={()=>setInv(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"3px 5px",cursor:"pointer",fontSize:10}}>×</button></div></td></>
                                  ):(
                                    <>{[row.tipo_doc,row.numero,row.data,row.classe,row.tipo_residuo,row.volume||"—",row.unidade||"t",row.transportador,row.destinador,row.tratamento].map((v,ci)=>(
                                      <td key={ci} style={{...(i%2?TA:TD),whiteSpace:"nowrap",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis"}}>{v||"—"}</td>
                                    ))}
                                    <td style={i%2?TA:TD}><div style={{display:"flex",gap:3}}><button onClick={()=>setInv(prev=>prev.map((r,j)=>j===i?{...r,ed:true}:r))} style={{background:"none",border:"1px solid #5a4fcf",color:"#5a4fcf",borderRadius:5,padding:"3px 6px",cursor:"pointer",fontSize:10}}>✏️</button><button onClick={()=>setInv(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"3px 5px",cursor:"pointer",fontSize:10}}>×</button></div></td></>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {inv.length>0&&(()=>{
                        var pt={}; inv.forEach(r=>{var t=r.tipo_residuo||"Outros";pt[t]=(pt[t]||0)+(parseFloat(r.volume)||0);});
                        var tG=Object.values(pt).reduce((a,b)=>a+b,0);
                        var dp=Object.entries(pt).filter(function(e){return e[1]>0;}).map(function(e){return{name:e[0],value:parseFloat(e[1].toFixed(3)),pct:tG>0?parseFloat((e[1]/tG*100).toFixed(1)):0};}).sort((a,b)=>b.value-a.value);
                        var pm={}; inv.forEach(r=>{var pts=(r.data||"").split("/");var m=pts.length===3?parseInt(pts[1],10)-1:-1;var k=m>=0&&m<12?MPT[m]+" "+pts[2]:r.data||"?";pm[k]=(pm[k]||0)+(parseFloat(r.volume)||0);});
                        var dm=Object.entries(pm).map(function(e){return{mes:e[0],vol:parseFloat(e[1].toFixed(3))};}).sort((a,b)=>parseInt(a.mes.split(" ")[1]||0)-parseInt(b.mes.split(" ")[1]||0));
                        var pico=dm.length>0?dm.reduce((a,b)=>b.vol>a.vol?b:a,dm[0]):null;
                        return (
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                            <div style={CD}>
                              <div style={{fontSize:12,fontWeight:"bold",color:"#5a4fcf",marginBottom:2}}>♻️ Resíduos por Tipo (%)</div>
                              <div style={{fontSize:10,color:"#888",marginBottom:8}}>Total: {tG.toFixed(2)}</div>
                              <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={dp} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" paddingAngle={2} label={({name,value,percent})=>value+" ("+(percent*100).toFixed(0)+"%)"}>{dp.map((_,i)=><Cell key={i} fill={COR[i%COR.length]}/>)}</Pie><Tooltip formatter={(v,n,pr)=>[v+" ("+pr.payload.pct+"%)",n]}/></PieChart></ResponsiveContainer>
                              <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>{dp.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:10}}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:2,background:COR[i%COR.length],flexShrink:0}}/><span>{d.name}</span></div><div style={{display:"flex",gap:8}}><span style={{color:"#888"}}>{d.value}</span><span style={{fontWeight:"bold",color:COR[i%COR.length],minWidth:36,textAlign:"right"}}>{d.pct}%</span></div></div>))}</div>
                            </div>
                            <div style={CD}>
                              <div style={{fontSize:12,fontWeight:"bold",color:"#5a4fcf",marginBottom:2}}>📊 Geração Mensal</div>
                              <div style={{fontSize:10,color:"#888",marginBottom:8}}>Volume por competência</div>
                              <ResponsiveContainer width="100%" height={200}><BarChart data={dm} margin={{top:20,right:10,left:0,bottom:dm.length>4?40:10}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/><XAxis dataKey="mes" tick={{fontSize:9}} angle={dm.length>4?-35:0} textAnchor={dm.length>4?"end":"middle"} interval={0}/><YAxis tick={{fontSize:9}}/><Tooltip formatter={v=>[v,"Volume"]}/><Bar dataKey="vol" fill="#5a4fcf" radius={[4,4,0,0]} maxBarSize={48}><LabelList dataKey="vol" position="top" style={{fontSize:9,fontWeight:"bold"}}/></Bar></BarChart></ResponsiveContainer>
                              {pico&&<div style={{marginTop:8,padding:"7px 10px",background:"#f8f7ff",borderRadius:7,border:"1px solid #e0dcff"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:"#888"}}>Total acumulado</span><span style={{fontWeight:"bold",color:"#5a4fcf"}}>{dm.reduce((a,b)=>a+b.vol,0).toFixed(2)}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:3}}><span style={{color:"#888"}}>Pico</span><span style={{fontWeight:"bold",color:"#5a4fcf"}}>{pico.mes} ({pico.vol.toFixed(2)})</span></div></div>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {pd==="efluentes"&&(
                    <div style={{...CD,border:"1px solid #0e6b7c44",background:"#f5fbfd",marginBottom:14}}>
                      <div style={{fontSize:12,fontWeight:"bold",color:"#0e6b7c",marginBottom:8}}>🛢️ Registro de Efluentes</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                        <div><label style={LB}>Volume gerado</label><input value={d.vol_gerado||""} onChange={e=>set({vol_gerado:e.target.value})} placeholder="Ex: 150" style={SI}/></div>
                        <div><label style={LB}>Unidade</label>
                          <select value={d.unid_efl||"m3"} onChange={e=>set({unid_efl:e.target.value})} style={SI}>
                            <option value="m3">m³</option><option value="L">Litros (L)</option><option value="kg">kg</option><option value="t">Tonelada (t)</option><option value="un">Unidade (un)</option>
                          </select>
                        </div>
                        <div><label style={LB}>Destinação</label><input value={d.dest_efl||""} onChange={e=>set({dest_efl:e.target.value})} placeholder="Ex: ETE, fossa" style={SI}/></div>
                      </div>
                    </div>
                  )}
                  {pd==="supveg"&&(
                    <div style={CD}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                        <div><h3 style={{color:p.cor,fontSize:13,margin:0}}>🪓 Laudo de Cubagem</h3><div style={{fontSize:10,color:"#888",marginTop:2}}>Inventário florestal para cálculo de volume de madeira</div></div>
                        <button onClick={()=>{var n={id:Date.now(),leira:"",larg:"",alt:"",comp_dim:"",vol_st:"",vol_m3_leira:"",n_toras:"",nome_cient:"",nome_pop:"",comp_m:"",diam1:"",diam2:"",vol_m3_ind:"",vol_total_esp:""};setD("supveg",{cubagem:[...(getD("supveg").cubagem||[]),n]});}} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"7px 14px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Linha</button>
                      </div>
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:1200}}>
                          <thead><tr>{["Leira Nº","Dimensões (larg × alt × comp)","Volume (st)","Volume (m³) Leira","Nº Toras","Nome Científico","Nome Popular","Comp. (m)","Diam. 01 (m)","Diam. 02 (m)","Volume (m³)","Vol. Total por Espécie (m³)",""].map((h,i)=>(
                            <th key={i} style={{...TH,background:p.cor,whiteSpace:"nowrap",padding:"6px 7px",minWidth:i===1?160:i===5||i===6?120:70}}>{h}</th>
                          ))}</tr></thead>
                          <tbody>
                            {(getD("supveg").cubagem||[]).length===0&&<tr><td colSpan={13} style={{...TD,textAlign:"center",color:"#ccc",padding:"20px",fontStyle:"italic"}}>Nenhum registro — clique em "+ Adicionar Linha"</td></tr>}
                            {(getD("supveg").cubagem||[]).map((row,ri)=>{
                              var updR=patch=>{var arr=[...(getD("supveg").cubagem||[])];arr[ri]={...arr[ri],...patch};setD("supveg",{cubagem:arr});};
                              var remR=()=>setD("supveg",{cubagem:(getD("supveg").cubagem||[]).filter((_,j)=>j!==ri)});
                              var i2={padding:"3px 5px",border:"1px solid #ddd",borderRadius:4,fontSize:10,fontFamily:"Georgia,serif",width:"100%",outline:"none",background:ri%2?"#f8fdf9":"#fff"};
                              return(
                                <tr key={row.id} style={{background:ri%2?"#f8fdf9":"#fff"}}>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.leira||""} onChange={e=>updR({leira:e.target.value})} style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><div style={{display:"flex",gap:2,alignItems:"center"}}><input value={row.larg||""} onChange={e=>updR({larg:e.target.value})} placeholder="larg" style={{...i2,width:40}}/><span style={{fontSize:9,color:"#999"}}>×</span><input value={row.alt||""} onChange={e=>updR({alt:e.target.value})} placeholder="alt" style={{...i2,width:40}}/><span style={{fontSize:9,color:"#999"}}>×</span><input value={row.comp_dim||""} onChange={e=>updR({comp_dim:e.target.value})} placeholder="comp" style={{...i2,width:40}}/></div></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.vol_st||""} onChange={e=>updR({vol_st:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.vol_m3_leira||""} onChange={e=>updR({vol_m3_leira:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.n_toras||""} onChange={e=>updR({n_toras:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.nome_cient||""} onChange={e=>updR({nome_cient:e.target.value})} style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.nome_pop||""} onChange={e=>updR({nome_pop:e.target.value})} style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.comp_m||""} onChange={e=>updR({comp_m:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.diam1||""} onChange={e=>updR({diam1:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.diam2||""} onChange={e=>updR({diam2:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.vol_m3_ind||""} onChange={e=>updR({vol_m3_ind:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><input value={row.vol_total_esp||""} onChange={e=>updR({vol_total_esp:e.target.value})} type="number" style={i2}/></td>
                                  <td style={{...TD,padding:"3px 4px"}}><button onClick={remR} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"3px 6px",cursor:"pointer",fontSize:10}}>×</button></td>
                                </tr>
                              );
                            })}
                            {(getD("supveg").cubagem||[]).length>0&&(()=>{
                              var ts=0,tm=0,tt=0,ti=0,te=0;
                              (getD("supveg").cubagem||[]).forEach(r=>{ts+=(parseFloat(r.vol_st)||0);tm+=(parseFloat(r.vol_m3_leira)||0);tt+=(parseInt(r.n_toras)||0);ti+=(parseFloat(r.vol_m3_ind)||0);te+=(parseFloat(r.vol_total_esp)||0);});
                              return(<tr style={{background:"#f0f7f0",fontWeight:"bold"}}><td style={{...TD,fontWeight:"bold",color:p.cor}} colSpan={2}>TOTAL</td><td style={{...TD,fontWeight:"bold",color:p.cor}}>{ts.toFixed(3)}</td><td style={{...TD,fontWeight:"bold",color:p.cor}}>{tm.toFixed(3)}</td><td style={{...TD,fontWeight:"bold",color:p.cor}}>{tt}</td><td colSpan={5} style={TD}></td><td style={{...TD,fontWeight:"bold",color:p.cor}}>{ti.toFixed(3)}</td><td style={{...TD,fontWeight:"bold",color:p.cor}}>{te.toFixed(3)}</td><td style={TD}></td></tr>);
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  <div style={CD}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <h3 style={{color:p.cor,fontSize:13,margin:0}}>📊 Gráficos</h3>
                      <button onClick={()=>{var g={id:Date.now(),titulo:"Novo Gráfico",tipo:"barra",cor:p.cor,unidade:"",addRel:false,texto:"",dados:[]};set({graficos:[...(d.graficos||[]),g]});}} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Gráfico</button>
                    </div>
                    {(d.graficos||[]).length===0&&<div style={{textAlign:"center",padding:"24px",color:"#bbb",fontSize:12,border:"2px dashed #e0e0e0",borderRadius:10}}>Nenhum gráfico ainda. Clique em "+ Adicionar Gráfico".</div>}
                    {(d.graficos||[]).map((gr,gi)=>{
                      var gd2=(gr.dados||[]).filter(x=>x.l&&x.v);
                      var setGr=patch=>{var arr=[...(d.graficos||[])];arr[gi]={...arr[gi],...patch};set({graficos:arr});};
                      var setDado=(di,patch)=>{var arr=[...(d.graficos||[])];var dd=[...(arr[gi].dados||[])];dd[di]={...dd[di],...patch};arr[gi]={...arr[gi],dados:dd};set({graficos:arr});};
                      var remGr=()=>set({graficos:(d.graficos||[]).filter((_,j)=>j!==gi)});
                      var addDado=()=>{var arr=[...(d.graficos||[])];var cor_auto=COR[(arr[gi].dados||[]).length%COR.length];arr[gi]={...arr[gi],dados:[...(arr[gi].dados||[]),{l:"",v:"",cor:cor_auto}]};set({graficos:arr});};
                      var remDado=di=>{var arr=[...(d.graficos||[])];arr[gi]={...arr[gi],dados:(arr[gi].dados||[]).filter((_,j)=>j!==di)};set({graficos:arr});};
                      return(
                        <div key={gr.id} style={{border:"2px solid "+(gr.addRel?p.cor+"88":p.cor+"33"),borderRadius:10,padding:14,marginBottom:14,background:gr.addRel?"#f5fdf7":"#fafdfb"}}>
                          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
                            <input value={gr.titulo||""} onChange={e=>setGr({titulo:e.target.value})} placeholder="Título do gráfico" style={{...SI,flex:1,fontWeight:"bold",fontSize:13}}/>
                            <button onClick={remGr} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,whiteSpace:"nowrap"}}>Remover</button>
                          </div>
                          <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                            <div><label style={LB}>Tipo</label><select value={gr.tipo||"barra"} onChange={e=>setGr({tipo:e.target.value})} style={{...SI,width:110}}><option value="barra">Barras</option><option value="pizza">Pizza</option></select></div>
                            <div><label style={LB}>Unidade de Medida</label><select value={gr.unidade||""} onChange={e=>setGr({unidade:e.target.value})} style={{...SI,width:140}}><option value="">Sem unidade</option><option value="t">Tonelada (t)</option><option value="kg">kg</option><option value="m">Metro (m)</option><option value="m2">m²</option><option value="m3">m³</option><option value="L">Litros (L)</option><option value="un">Unidade (un)</option><option value="%">Percentual (%)</option></select></div>
                          </div>
                          <div style={{marginBottom:10}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                              <label style={LB}>Rótulos, Valores e Cores</label>
                              <button onClick={addDado} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"5px 13px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Rótulo</button>
                            </div>
                            {(gr.dados||[]).map((g,di)=>(
                              <div key={di} style={{display:"flex",gap:6,marginBottom:4,alignItems:"center"}}>
                                <input value={g.l} onChange={e=>setDado(di,{l:e.target.value})} placeholder="Rótulo" style={{...SI,flex:2}}/>
                                <div style={{display:"flex",alignItems:"center",flex:1,gap:4}}>
                                  <input value={g.v} onChange={e=>setDado(di,{v:e.target.value})} placeholder="Valor" type="number" style={{...SI,flex:1,minWidth:60}}/>
                                  {gr.unidade&&<span style={{fontSize:11,color:"#5a6b60",fontWeight:"bold",whiteSpace:"nowrap",padding:"0 6px",background:"#eef5f0",borderRadius:5,border:"1px solid #c8ddd2",height:34,display:"flex",alignItems:"center"}}>{gr.unidade}</span>}
                                </div>
                                <input type="color" value={g.cor||gr.cor||p.cor} onChange={e=>setDado(di,{cor:e.target.value})} style={{width:32,height:32,padding:0,border:"2px solid #ddd",cursor:"pointer",borderRadius:6}} title="Cor desta barra/fatia"/>
                                <button onClick={()=>remDado(di)} style={{background:"none",border:"1px solid #ddd",borderRadius:5,padding:"4px 8px",cursor:"pointer",color:"#999"}}>×</button>
                              </div>
                            ))}
                            {(gr.dados||[]).length===0&&<div style={{fontSize:11,color:"#bbb",fontStyle:"italic"}}>Clique em "+ Adicionar Rótulo".</div>}
                          </div>
                          {gd2.length>0&&(
                            <div style={{marginTop:8,padding:10,background:"#fff",borderRadius:8,border:"1px solid #e8e8e8"}}>
                              {renderGrafico(gr, 200, false)}
                            </div>
                          )}
                          <div style={{marginTop:10}}>
                            <label style={LB}>Texto Interpretativo (vai para o relatório)</label>
                            <textarea value={gr.texto||""} onChange={e=>setGr({texto:e.target.value})} rows={2} placeholder="Ex: Os dados demonstram que houve redução de 30% na geração de resíduos no período..." style={{...SI,resize:"vertical",fontSize:12}}/>
                          </div>
                          <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{fontSize:11,color:"#888"}}>{gr.addRel?"✅ Incluído no relatório":"⬜ Não incluído no relatório"}</div>
                            <button onClick={()=>setGr({addRel:!gr.addRel})} style={{background:gr.addRel?"#2d6a4f":p.cor,color:"#fff",border:"none",borderRadius:8,padding:"7px 18px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>
                              {gr.addRel?"✓ Adicionado ao Relatório":"+ Adicionar ao Relatório"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {/* CONFIG */}
        {aba==="config"&&(
          <div>
            <h2 style={{color:HC,marginBottom:14}}>⚙️ Configurações do Relatório</h2>
            <div style={{fontSize:12,color:"#888",marginBottom:16}}>Preencha os dados antes de gerar o relatório. As configurações são salvas automaticamente.</div>
            <div id="cfg-card" style={{...CD,border:"1px solid #c8ddd2",marginBottom:14}}>
              <button onClick={()=>setCfg(c=>!c)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",fontFamily:"Georgia,serif",padding:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span>⚙️</span><div><div style={{fontSize:13,fontWeight:"bold",color:HC}}>Configurações do Relatório</div><div style={{fontSize:10,color:"#888"}}>Logos, identificação, período, programas, cores</div></div></div>
                <span style={{transform:cfg?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span>
              </button>
              {cfg&&(
                <div style={{marginTop:14,borderTop:"1px solid #e2ebe5",paddingTop:14}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
                    <div>
                      <h4 style={{color:"#2d6a4f",marginBottom:10,fontSize:12}}>🏢 Logos</h4>
                      <label style={LB}>Logo Empresa Executora</label>
                      <input type="file" accept="image/*" onChange={e=>e.target.files[0]&&setLogo(setLCons,e.target.files[0])} style={{...SI,padding:"5px",border:"2px dashed #a8c5b5",cursor:"pointer",marginBottom:5}}/>
                      {lCons&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><img src={lCons} alt="" style={{height:28,objectFit:"contain"}}/><button onClick={()=>setLCons(null)} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"1px 6px",cursor:"pointer",fontSize:10}}>×</button></div>}
                      <label style={LB}>Logo Empreendedor</label>
                      <input type="file" accept="image/*" onChange={e=>e.target.files[0]&&setLogo(setLEmpr,e.target.files[0])} style={{...SI,padding:"5px",border:"2px dashed #a8c5b5",cursor:"pointer",marginBottom:5}}/>
                      {lEmpr&&<div style={{display:"flex",alignItems:"center",gap:6}}><img src={lEmpr} alt="" style={{height:28,objectFit:"contain"}}/><button onClick={()=>setLEmpr(null)} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"1px 6px",cursor:"pointer",fontSize:10}}>×</button></div>}
                    </div>
                    <div>
                      <h4 style={{color:"#2d6a4f",marginBottom:10,fontSize:12}}>📅 Período</h4>
                      <label style={LB}>Número do Relatório</label>
                      <input value={nrel} onChange={e=>setNrel(e.target.value)} placeholder="Ex: 11" style={{...SI,marginBottom:8}}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div><label style={LB}>Mês</label><select value={mes} onChange={e=>setMes(e.target.value)} style={SI}>{MSL.map(m=><option key={m}>{m}</option>)}</select></div>
                        <div><label style={LB}>Ano</label><select value={ano} onChange={e=>setAno(e.target.value)} style={SI}>{ANS.map(a=><option key={a}>{a}</option>)}</select></div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{color:"#2d6a4f",marginBottom:10,fontSize:12}}>🎨 Cor das Tabelas</h4>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{[HC,"#1a6b9a","#b08000","#5a4fcf","#b5451b","#2d6a4f","#0e6b7c","#333"].map(c=>(<div key={c} onClick={()=>setCor(c)} style={{width:26,height:26,borderRadius:5,background:c,cursor:"pointer",border:"3px solid "+(cor===c?"#fff":"transparent"),boxShadow:cor===c?"0 0 0 2px "+c:"none"}}/>))}<input type="color" value={cor} onChange={e=>setCor(e.target.value)} style={{width:26,height:26,padding:0,border:"none",cursor:"pointer",borderRadius:5}}/></div>
                      <div style={{padding:"8px 12px",borderRadius:8,background:cor}}><span style={{color:"#fff",fontSize:11,fontWeight:"bold"}}>Prévia do Cabeçalho</span></div>
                    </div>
                  </div>
                  <div style={{borderTop:"1px solid #e2ebe5",paddingTop:12,marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <h4 style={{color:"#2d6a4f",fontSize:12,margin:0}}>🪪 Identificação</h4>
                      <button onClick={()=>setCampos(c=>[...c,{id:"fc"+Date.now(),lb:"Novo Campo",val:"",ed:true}])} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 11px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:10,fontWeight:"bold"}}>+ Campo</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {campos.map(f=>(<div key={f.id} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 8px",background:"#fafdfb",borderRadius:7,border:"1px solid #e2ebe5"}}><div style={{width:160,cursor:"pointer",flexShrink:0}} onClick={()=>updC(f.id,{ed:!f.ed})}>{f.ed?<input autoFocus value={f.lb} onChange={e=>updC(f.id,{lb:e.target.value})} onBlur={()=>updC(f.id,{ed:false})} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")updC(f.id,{ed:false});}} style={{...SI,fontSize:10,padding:"2px 5px",border:"1px solid #2d6a4f"}}/>:<div style={{fontSize:10,fontWeight:"bold",color:"#2d6a4f"}}>{f.lb} <span style={{opacity:0.4,fontSize:9}}>✏️</span></div>}</div><input value={f.val} onChange={e=>updC(f.id,{val:e.target.value})} style={{...SI,flex:1,fontSize:11,padding:"4px 7px"}}/><button onClick={()=>setCampos(c=>c.filter(x=>x.id!==f.id))} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"3px 6px",cursor:"pointer",fontSize:11}}>×</button></div>))}
                    </div>
                  </div>
                  <div style={{borderTop:"1px solid #e2ebe5",paddingTop:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <h4 style={{color:"#2d6a4f",fontSize:12,margin:0}}>📋 Programas em Execução</h4>
                      <button onClick={()=>{var n=window.prompt("Nome do novo programa:");if(n&&n.trim()){var id="c_"+Date.now();setPCust(c=>[...c,{id,lb:n.trim(),cor:"#2d6a4f",ic:"📋",custom:true}]);setPAtiv(a=>[...a,id]);}}} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 11px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:10,fontWeight:"bold"}}>+ Programa</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:4}}>
                      {todos.map(p=>{var ativo=pAtiv.includes(p.id);return(
                        <div key={p.id} style={{borderRadius:7,border:"2px solid "+(ativo?p.cor:"#ddd"),background:ativo?p.cor+"12":"#fafafa"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5,padding:"6px 9px"}}>
                            <input type="checkbox" checked={ativo} onChange={e=>{if(e.target.checked)setPAtiv(a=>[...a,p.id]);else setPAtiv(a=>a.filter(id=>id!==p.id));}} style={{width:13,height:13,accentColor:p.cor,cursor:"pointer"}}/>
                            <span style={{fontSize:12}}>{p.ic}</span>
                            {enome===p.id?<input autoFocus value={nomes[p.id]!==undefined?nomes[p.id]:p.lb} onChange={e=>setNomes(n=>({...n,[p.id]:e.target.value}))} onBlur={()=>setEnome(null)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")setEnome(null);}} style={{flex:1,fontSize:10,padding:"1px 5px",border:"1px solid "+p.cor,borderRadius:4,fontFamily:"Georgia,serif",outline:"none"}}/>:<span style={{flex:1,fontSize:10,color:ativo?p.cor:"#888",fontWeight:ativo?"bold":"normal"}}>{getL(p.id)}</span>}
                            <button onClick={e=>{e.preventDefault();setEnome(enome===p.id?null:p.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,opacity:0.5}}>✏️</button>
                            {p.custom&&<button onClick={()=>{setPCust(c=>c.filter(x=>x.id!==p.id));setPAtiv(a=>a.filter(id=>id!==p.id));}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#b5451b"}}>×</button>}
                          </div>
                        </div>
                      );})}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* IDENTIFICAÇÃO DO EMPREENDEDOR E CONSULTORA */}
            <div style={{...CD,border:"1px solid #c8ddd2",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <h4 style={{color:HC,fontSize:13,margin:0}}>🏢 Identificação do Empreendedor</h4>
                <button onClick={()=>setIdent(id=>({...id,empr_campos:[...(id.empr_campos||[]),{k:"ec"+Date.now(),lb:"Novo Campo",val:""}]}))} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:"bold"}}>+ Campo</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                {[["empr_nome","Empreendedor"],["empr_cnpj","CNPJ"],["empr_end","Endereço"],["empr_tel","Telefone"],["empr_rep","Representante Legal"],["empr_email","E-mail"]].filter(([k])=>!((ident.empr_excluidos||[]).includes(k))).map(([k,lb])=>(
                  <div key={k} style={{display:"flex",gap:4,alignItems:"flex-end"}}>
                    <div style={{flex:1}}><label style={LB}>{lb}</label><input value={ident[k]||""} onChange={e=>setIdent(id=>({...id,[k]:e.target.value}))} style={{...SI,fontSize:11}}/></div>
                    <button onClick={()=>setIdent(id=>({...id,empr_excluidos:[...(id.empr_excluidos||[]),k]}))} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"6px 8px",cursor:"pointer",fontSize:12,marginBottom:1}} title="Excluir campo">×</button>
                  </div>
                ))}
                {(ident.empr_campos||[]).map((c,ci)=>(
                  <div key={c.k} style={{display:"flex",gap:4,alignItems:"flex-end"}}>
                    <div style={{flex:1}}>
                      <input value={c.lb} onChange={e=>setIdent(id=>({...id,empr_campos:id.empr_campos.map((x,i)=>i===ci?{...x,lb:e.target.value}:x)}))} style={{...SI,fontSize:9,padding:"2px 5px",marginBottom:3,fontWeight:"bold",color:"#2d6a4f"}}/>
                      <input value={c.val} onChange={e=>setIdent(id=>({...id,empr_campos:id.empr_campos.map((x,i)=>i===ci?{...x,val:e.target.value}:x)}))} style={{...SI,fontSize:11}}/>
                    </div>
                    <button onClick={()=>setIdent(id=>({...id,empr_campos:id.empr_campos.filter((_,i)=>i!==ci)}))} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"6px 8px",cursor:"pointer",fontSize:12,marginBottom:1}}>×</button>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,marginTop:16,borderTop:"1px solid #e2ebe5",paddingTop:14}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13}}>🔬</span>
                  <input value={ident.cons_titulo||"Identificação da Empresa Consultora"} onChange={e=>setIdent(id=>({...id,cons_titulo:e.target.value}))} style={{fontSize:12,fontWeight:"bold",color:HC,border:"1px dashed #c8ddd2",padding:"3px 8px",width:300,borderRadius:5,fontFamily:"Georgia,serif",background:"transparent"}} title="Clique para editar"/>
                </div>
                <button onClick={()=>setIdent(id=>({...id,cons_campos:[...(id.cons_campos||[]),{k:"cc"+Date.now(),lb:"Novo Campo",val:""}]}))} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:"bold"}}>+ Campo</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["cons_nome","Empresa Consultora"],["cons_cnpj","CNPJ"],["cons_end","Endereço"],["cons_tel","Telefone"],["cons_rep","Representante Legal"],["cons_email","E-mail"]].filter(([k])=>!((ident.cons_excluidos||[]).includes(k))).map(([k,lb])=>(
                  <div key={k} style={{display:"flex",gap:4,alignItems:"flex-end"}}>
                    <div style={{flex:1}}><label style={LB}>{lb}</label><input value={ident[k]||""} onChange={e=>setIdent(id=>({...id,[k]:e.target.value}))} style={{...SI,fontSize:11}}/></div>
                    <button onClick={()=>setIdent(id=>({...id,cons_excluidos:[...(id.cons_excluidos||[]),k]}))} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"6px 8px",cursor:"pointer",fontSize:12,marginBottom:1}} title="Excluir campo">×</button>
                  </div>
                ))}
                {(ident.cons_campos||[]).map((c,ci)=>(
                  <div key={c.k} style={{display:"flex",gap:4,alignItems:"flex-end"}}>
                    <div style={{flex:1}}>
                      <input value={c.lb} onChange={e=>setIdent(id=>({...id,cons_campos:id.cons_campos.map((x,i)=>i===ci?{...x,lb:e.target.value}:x)}))} style={{...SI,fontSize:9,padding:"2px 5px",marginBottom:3,fontWeight:"bold",color:"#2d6a4f"}}/>
                      <input value={c.val} onChange={e=>setIdent(id=>({...id,cons_campos:id.cons_campos.map((x,i)=>i===ci?{...x,val:e.target.value}:x)}))} style={{...SI,fontSize:11}}/>
                    </div>
                    <button onClick={()=>setIdent(id=>({...id,cons_campos:id.cons_campos.filter((_,i)=>i!==ci)}))} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"6px 8px",cursor:"pointer",fontSize:12,marginBottom:1}}>×</button>
                  </div>
                ))}
              </div>
            </div>
            {/* EQUIPE TÉCNICA */}
            <div style={{...CD,border:"1px solid #c8ddd2",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h4 style={{color:HC,fontSize:13,margin:0}}>👥 Equipe Técnica</h4>
                <button onClick={()=>setEquipe(eq=>[...eq,{id:Date.now(),nome:"",funcao:"",registro:""}])} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11,fontWeight:"bold"}}>+ Adicionar Membro</button>
              </div>
              {equipe.length===0&&<div style={{fontSize:11,color:"#bbb",fontStyle:"italic",textAlign:"center",padding:"16px 0"}}>Nenhum membro cadastrado.</div>}
              {equipe.map((m,mi)=>(
                <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,marginBottom:8,alignItems:"end"}}>
                  <div><label style={LB}>Nome</label><input value={m.nome} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,nome:e.target.value}:x))} style={{...SI,fontSize:11}}/></div>
                  <div><label style={LB}>Função</label><input value={m.funcao} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,funcao:e.target.value}:x))} style={{...SI,fontSize:11}}/></div>
                  <div><label style={LB}>Registro Profissional</label><input value={m.registro} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,registro:e.target.value}:x))} style={{...SI,fontSize:11}}/></div>
                  <button onClick={()=>setEquipe(eq=>eq.filter((_,i)=>i!==mi))} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:6,padding:"7px 10px",cursor:"pointer",fontSize:13,marginBottom:1}}>×</button>
                </div>
              ))}
            </div>
            <div id="extra-card" style={{...CD,border:"1px solid #2d6a4f44",background:"linear-gradient(135deg,#f5fdf7,#fff)",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:"bold",color:"#2d6a4f",marginBottom:8}}>✨ Adicionar Programa Extra com IA</div>
              <div style={{display:"flex",gap:8}}>
                <input value={novo} onChange={e=>setNovo(e.target.value)} placeholder="Nome do programa..." style={{...SI,flex:1}} onKeyDown={e=>{if(e.key==="Enter"&&novo.trim())addExtra();}}/>
                <button onClick={addExtra} disabled={!novo.trim()||ger} style={{background:!novo.trim()||ger?"#ccc":"linear-gradient(135deg,#2d6a4f,#1a3d2b)",color:"#fff",border:"none",borderRadius:8,padding:"9px 14px",cursor:!novo.trim()||ger?"not-allowed":"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold",whiteSpace:"nowrap"}}>{ger?"⏳ Gerando...":"✨ Adicionar"}</button>
              </div>
            </div>
          </div>
        )}
        {/* RELATORIO */}
        {aba==="relatorio"&&(
          <div>
            <h2 style={{color:HC,marginBottom:14}}>📄 Relatório Mensal</h2>
            <div id="reldoc" style={{background:"#fff",borderRadius:14,boxShadow:"0 3px 20px rgba(0,0,0,0.10)",overflow:"hidden",border:"1px solid #dde5db"}}>
              <Cab/>
              <div style={{padding:"28px 40px"}}>
                {/* CAPA */}
                <div id="capa-rel" style={{textAlign:"center",padding:"60px 0 40px",marginBottom:0,pageBreakAfter:"always",minHeight:"60vh",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{fontSize:12,color:"#555",marginBottom:12}}>{(ident.cons_nome||emp||"Empresa Executora")} apresenta a {(ident.empr_nome||campos.find(c=>c.id==="f2")?.val||"MMA Field")} o documento:</div>
                  <div style={{fontSize:14,fontWeight:"bold",color:cor,lineHeight:1.7,marginBottom:12}}>RELATÓRIO MENSAL DE GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS{nEmp&&<><br/>{nEmp.toUpperCase()}</>}<br/>PERÍODO DE {mes.toUpperCase()}/{ano}</div>
                </div>
                {/* SUMÁRIO */}
                <div style={{pageBreakAfter:"always",paddingTop:10,minHeight:180}}>
                  <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:16,textAlign:"left"}}>SUMÁRIO</h2>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><tbody>
                    <tr><td style={{padding:"4px 0",color:cor,fontWeight:"bold",width:30}}>1.</td><td style={{padding:"4px 8px",fontWeight:"bold"}}>IDENTIFICAÇÃO DO EMPREENDIMENTO</td><td style={{textAlign:"right",color:"#888"}}>3</td></tr>
                    <tr><td style={{padding:"4px 0",color:cor,fontWeight:"bold"}}>2.</td><td style={{padding:"4px 8px",fontWeight:"bold"}}>IDENTIFICAÇÃO DA EQUIPE TÉCNICA</td><td style={{textAlign:"right",color:"#888"}}>4</td></tr>
                    <tr><td style={{padding:"4px 0",color:cor,fontWeight:"bold"}}>3.</td><td style={{padding:"4px 8px",fontWeight:"bold"}}>INTRODUÇÃO</td><td style={{textAlign:"right",color:"#888"}}>5</td></tr>
                    <tr><td style={{padding:"4px 0",color:cor,fontWeight:"bold"}}>4.</td><td style={{padding:"4px 8px",fontWeight:"bold"}}>PROGRAMAS EM EXECUÇÃO</td><td style={{textAlign:"right",color:"#888"}}>5</td></tr>
                    <tr><td style={{padding:"4px 0",color:cor,fontWeight:"bold"}}>5.</td><td style={{padding:"4px 8px",fontWeight:"bold"}}>GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS</td><td style={{textAlign:"right",color:"#888"}}>6</td></tr>
                    {ativos.map((p,i)=><tr key={p.id}><td style={{padding:"3px 0 3px 16px",color:"#aaa",width:30}}></td><td style={{padding:"3px 8px",color:"#555"}}>5.{i+1} {getL(p.id)}</td><td style={{textAlign:"right",color:"#bbb"}}>{7+i}</td></tr>)}
                  </tbody></table>
                </div>
                {/* PÁG 3 - IDENTIFICAÇÃO */}
                <div style={{pageBreakAfter:"always",paddingTop:10}}>
                  <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:14,textAlign:"left"}}>1. IDENTIFICAÇÃO DO EMPREENDIMENTO</h2>
                  <h4 style={{color:"#555",fontSize:11,marginBottom:8}}>Quadro 1 – Identificação do Empreendedor</h4>
                  <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20,fontSize:11}}><tbody>
                    {[["empr_nome","Empreendedor",ident.empr_nome||campos.find(c=>c.id==="f2")?.val||"—"],["empr_cnpj","CNPJ",ident.empr_cnpj||"—"],["empr_end","Endereço",ident.empr_end||"—"],["empr_tel","Telefone",ident.empr_tel||"—"],["empr_rep","Representante Legal",ident.empr_rep||campos.find(c=>c.id==="f5")?.val||"—"],["empr_email","E-mail",ident.empr_email||"—"]].filter(([k])=>!((ident.empr_excluidos||[]).includes(k))).concat((ident.empr_campos||[]).map(c=>[c.k,c.lb,c.val||"—"])).map(([,lb,vl],i)=>(
                      <tr key={lb}><td style={{...TD,background:i%2?"#f8fdf9":"#fff",fontWeight:"bold",color:cor,width:200}}>{lb}</td><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{vl}</td></tr>
                    ))}
                  </tbody></table>
                  <h4 style={{color:"#555",fontSize:11,marginBottom:8}}>Quadro 2 – {ident.cons_titulo||"Identificação da Empresa Consultora"}</h4>
                  <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20,fontSize:11}}><tbody>
                    {[["cons_nome","Empresa Consultora",ident.cons_nome||emp||"—"],["cons_cnpj","CNPJ",ident.cons_cnpj||"—"],["cons_end","Endereço",ident.cons_end||"—"],["cons_tel","Telefone",ident.cons_tel||"—"],["cons_rep","Representante Legal",ident.cons_rep||"—"],["cons_email","E-mail",ident.cons_email||"—"]].filter(([k])=>!((ident.cons_excluidos||[]).includes(k))).concat((ident.cons_campos||[]).map(c=>[c.k,c.lb,c.val||"—"])).map(([,lb,vl],i)=>(
                      <tr key={lb}><td style={{...TD,background:i%2?"#f8fdf9":"#fff",fontWeight:"bold",color:cor,width:200}}>{lb}</td><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{vl}</td></tr>
                    ))}
                  </tbody></table>
                  {(nEmp||campos.find(c=>c.id==="f4")?.val)&&<><h4 style={{color:"#555",fontSize:11,marginBottom:8}}>Quadro 3 – Identificação do Empreendimento</h4>
                  <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20,fontSize:11}}><tbody>
                    {[["Nome do Empreendimento",nEmp||"—"],["Estado (UF)",campos.find(c=>c.id==="f4")?.val||"—"],...campos.filter(c=>!["f1","f2","f3","f4","f5"].includes(c.id)).map(c=>[c.lb,c.val||"—"])].map(([lb,vl],i)=>(
                      <tr key={lb}><td style={{...TD,background:i%2?"#f8fdf9":"#fff",fontWeight:"bold",color:cor,width:200}}>{lb}</td><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{vl}</td></tr>
                    ))}
                  </tbody></table></>}
                </div>
                {/* PÁG 4 - EQUIPE TÉCNICA */}
                <div style={{pageBreakAfter:"always",paddingTop:10}}>
                  <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:14,textAlign:"left"}}>2. IDENTIFICAÇÃO DA EQUIPE TÉCNICA</h2>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr><th style={{...TH,background:cor}}>Nome</th><th style={{...TH,background:cor}}>Função</th><th style={{...TH,background:cor}}>Registro Profissional</th></tr></thead>
                    <tbody>{equipe.length===0?<tr><td colSpan={3} style={{...TD,textAlign:"center",color:"#bbb",fontStyle:"italic"}}>Nenhum membro cadastrado</td></tr>:equipe.map((m,i)=><tr key={m.id}><td style={i%2?TA:TD}>{m.nome||"—"}</td><td style={i%2?TA:TD}>{m.funcao||"—"}</td><td style={i%2?TA:TD}>{m.registro||"—"}</td></tr>)}</tbody>
                  </table>
                </div>
                {/* PÁG 5 - INTRODUÇÃO */}
                <div style={{pageBreakAfter:"always",paddingTop:10}}>
                  <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:10,textAlign:"left"}}>3. INTRODUÇÃO</h2>
                  <textarea value={intro} onChange={e=>setIntro(e.target.value)} rows={6} style={{...SI,fontSize:12,lineHeight:1.8,color:"#444",resize:"vertical",border:"1px dashed #c8ddd2",background:"#fafdfb",width:"100%"}}/>
                </div>
                <div style={{marginBottom:20}}>
                  <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:10,textAlign:"left"}}>4. PROGRAMAS EM EXECUÇÃO</h2>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...TH,background:cor,width:40}}>Nº</th><th style={{...TH,background:cor}}>Programa</th><th style={{...TH,background:cor,width:120}}>Status</th></tr></thead><tbody>{ativos.map((p,i)=><tr key={p.id}><td style={i%2?TA:TD}>{i+1}</td><td style={i%2?TA:TD}>{p.ic} {getL(p.id)}</td><td style={{...(i%2?TA:TD),color:"#2d6a4f",fontWeight:"bold"}}>● Em Execução</td></tr>)}</tbody></table>
                </div>
                <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:18,textAlign:"left",pageBreakBefore:"always"}}>5. GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS</h2>
                {ativos.map((p,pi)=>{
                  var d=getD(p.id); var fp=getF(p.id);
                  var grafRel=(d.graficos||[]).filter(gr=>gr.addRel&&(gr.dados||[]).some(x=>x.l&&x.v));
                  return(
                    <div key={p.id} style={{marginBottom:32}}>
                      <h3 style={{color:cor,fontSize:13,borderLeft:"4px solid "+p.cor,paddingLeft:10,marginBottom:10,textAlign:"left"}}>{pi+1}. {getL(p.id).toUpperCase()}</h3>
                      {d.desc&&<p style={{fontSize:12,color:"#444",lineHeight:1.8,marginBottom:12,textAlign:"justify"}}>{d.desc}</p>}
                      {fp.length>0&&<div style={{marginBottom:12}}><h4 style={{fontSize:11,color:"#333",marginBottom:7,textAlign:"left"}}>{pi+1}.1 Registro Fotográfico</h4><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>{fp.map((f,fi)=><div key={f.id} style={{border:"1px solid #ddd",borderRadius:8,overflow:"hidden"}}><img src={f.src} alt={f.leg} style={{width:"100%",height:160,objectFit:"cover",objectPosition:"center",display:"block"}}/><div style={{padding:"5px 9px",background:"#fafafa",fontSize:10,textAlign:"center"}}>{f.geo&&<div style={{fontSize:8,color:"#888"}}>📍 {f.geo}</div>}<div>Foto {fi+1}{f.leg?" – "+f.leg:""}</div></div></div>)}</div></div>}
                      {grafRel.map((gr,gi)=>(
                        <div key={gi} style={{marginBottom:16}}>
                          <h4 style={{fontSize:11,color:"#333",marginBottom:5,textAlign:"left"}}>{gr.titulo||"Gráfico "+(gi+1)}</h4>
                          {renderGrafico(gr, 200, true)}
                          {gr.texto&&<p style={{fontSize:11,color:"#444",lineHeight:1.7,marginTop:8,fontStyle:"italic",borderLeft:"3px solid "+p.cor,paddingLeft:10}}>{gr.texto}</p>}
                        </div>
                      ))}
                    </div>
                  );
                })}
                {extras.map((pe,pi)=><div key={pe.id} style={{marginBottom:28}}><h3 style={{color:cor,fontSize:13,borderLeft:"4px solid #2d6a4f",paddingLeft:10,marginBottom:10,textAlign:"left"}}>{ativos.length+pi+1}. {pe.nome.toUpperCase()}</h3><p style={{fontSize:12,color:"#444",lineHeight:1.8}}>{pe.intro}</p></div>)}
                <div style={{marginTop:24,paddingTop:10,borderTop:"1px solid #ddd",display:"flex",justifyContent:"space-between",fontSize:9,color:"#aaa"}}><span>{emp}</span><span>{numR} Relatório – {mes}/{ano}</span></div>
              </div>
            </div>
          </div>
        )}
        {/* HISTORICO */}
        {aba==="historico"&&(
          <div>
            <h2 style={{color:HC,marginBottom:6}}>📁 Histórico e Download de Relatórios</h2>
            <p style={{fontSize:12,color:"#888",marginBottom:20}}>Abra, baixe ou exclua relatórios salvos. Use o botão <strong>"💾 Salvar Relatório"</strong> no topo para guardar o relatório atual.</p>
            {historico.length===0?(
              <div style={{...CD,textAlign:"center",padding:"48px 20px",color:"#aaa"}}>
                <div style={{fontSize:44,marginBottom:10}}>📁</div>
                <div style={{fontSize:14,fontWeight:"bold",color:"#2d6a4f",marginBottom:6}}>Nenhum relatório salvo</div>
                <div style={{fontSize:12}}>Clique em <strong>"💾 Salvar Relatório"</strong> no topo para salvar.</div>
              </div>
            ):(
              <div style={{display:"grid",gap:12}}>
                {historico.map(rel=>(
                  <div key={rel.id} style={{...CD,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:"bold",color:HC,marginBottom:4}}>📄 {rel.titulo}</div>
                      {rel.empreendimento&&<div style={{fontSize:12,color:"#555",marginBottom:2}}>🏗️ {rel.empreendimento}</div>}
                      {rel.empresa&&<div style={{fontSize:11,color:"#888",marginBottom:2}}>🏢 {rel.empresa}</div>}
                      <div style={{fontSize:10,color:"#aaa"}}>Salvo em {rel.data}</div>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                      <button onClick={()=>carregarRelatorio(rel)} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>📂 Abrir</button>
                      <button onClick={()=>baixarRelatorio(rel)} style={{background:"#5a4fcf",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>📥 Baixar Word</button>
                      <button onClick={()=>{carregarRelatorio(rel);setTimeout(function(){dlPDF();},1000);}} style={{background:"#b5451b",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>🖨️ Baixar PDF</button>
                      <button onClick={()=>excluirRelatorio(rel.id)} style={{background:"none",border:"2px solid #b5451b",color:"#b5451b",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12}}>🗑️ Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
