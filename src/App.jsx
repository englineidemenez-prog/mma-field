import React, { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LabelList } from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
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
// IMPORTANTE: estas chaves NUNCA devem ser usadas "puras" — sempre amarradas
// ao user.id, para que os dados de um usuário não apareçam para outro no
// mesmo navegador. Use sempre chaveSave(uid) / chaveHist(uid) abaixo.
function chaveSave(uid) { return SAVE_KEY + "_" + uid; }
function chaveHist(uid) { return HIST_KEY + "_" + uid; }

// ── Supabase helpers para sincronização na nuvem ──
async function sbCarregarEstado(userId) {
  try {
    const { data } = await supabase.from("relatorio_estado").select("estado").eq("user_id", userId).order("updated_at",{ascending:false}).limit(1).single();
    return data?.estado || null;
  } catch(e) { return null; }
}
async function sbSalvarEstado(userId, estado) {
  try {
    const { data: ex } = await supabase.from("relatorio_estado").select("id").eq("user_id", userId).limit(1).single();
    if (ex?.id) {
      await supabase.from("relatorio_estado").update({ estado, updated_at: new Date().toISOString() }).eq("id", ex.id);
    } else {
      await supabase.from("relatorio_estado").insert({ user_id: userId, estado, updated_at: new Date().toISOString() });
    }
  } catch(e) {}
}
async function sbCarregarHistorico(userId) {
  try {
    const { data } = await supabase.from("relatorio_historico").select("*").eq("user_id", userId).order("created_at",{ascending:false});
    return (data||[]).map(r => ({ ...r.dados, _sbId: r.id }));
  } catch(e) { return []; }
}
async function sbSalvarNoHistorico(userId, rel) {
  try {
    const { data } = await supabase.from("relatorio_historico").insert({ user_id: userId, dados: rel, created_at: new Date().toISOString() }).select().single();
    return data?.id;
  } catch(e) { return null; }
}
async function sbExcluirDoHistorico(sbId) {
  try { await supabase.from("relatorio_historico").delete().eq("id", sbId); } catch(e) {}
}
const INTRO_DEFAULT = "O presente relatório é referente ao atendimento dos Programas Ambientais do Plano Básico Ambiental (PBA), em conformidade com as condicionantes da Licença de Operação (LO) nº _______, emitida pelo órgão ambiental competente. As atividades descritas neste documento foram desenvolvidas no período de referência, visando o monitoramento, controle e mitigação dos impactos ambientais associados ao empreendimento.";

// ─────────────────────────────────────────────
// TELA DE AUTENTICAÇÃO
// ─────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [modo, setModo] = useState("login"); // "login" | "cadastro" | "esqueci"
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
    maxWidth:400,
    boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
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
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:42,marginBottom:8}}>🌿</div>
          <div style={{fontSize:22,fontWeight:"bold",color:HC,letterSpacing:1}}>MMA Field</div>
          <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:2,marginTop:3}}>Meu Mundo Ambiental</div>
        </div>

        {/* Título da tela */}
        <div style={{fontSize:15,fontWeight:"bold",color:HC,marginBottom:20,textAlign:"center"}}>
          {modo === "login" && "Entrar na sua conta"}
          {modo === "cadastro" && "Criar nova conta"}
          {modo === "esqueci" && "Recuperar senha"}
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#b00000"}}>
            ⚠️ {erro}
          </div>
        )}

        {/* Mensagem de sucesso */}
        {sucesso && (
          <div style={{background:"#f0fff4",border:"1px solid #a8e6c0",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#1a5c35"}}>
            ✅ {sucesso}
          </div>
        )}

        {/* Campos */}
        <div>
          <label style={{...LB,marginBottom:5}}>Email</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
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
                onChange={e => setConfirmar(e.target.value)}
                style={estiloInput}
              />
            </>
          )}
        </div>

        {/* Botão principal */}
        <button
          onClick={modo === "login" ? handleLogin : modo === "cadastro" ? handleCadastro : handleEsqueci}
          disabled={carregando}
          style={{...estiloBotao, opacity: carregando ? 0.7 : 1}}
        >
          {carregando ? "⏳ Aguarde..." : modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar Conta" : "Enviar Email de Recuperação"}
        </button>

        {/* Links de navegação */}
        <div style={{marginTop:20,textAlign:"center",display:"flex",flexDirection:"column",gap:8}}>
          {modo === "login" && (
            <>
              <button onClick={() => { setModo("cadastro"); setErro(""); setSucesso(""); }} style={estiloLink}>
                Não tem conta? Criar conta
              </button>
              <button onClick={() => { setModo("esqueci"); setErro(""); setSucesso(""); }} style={{...estiloLink,color:"#888"}}>
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
function buildRelHTML(dr) {
  var C=dr.cor||"#1a3d2b";
  var nEmp=(dr.empreendimento&&dr.empreendimento.nome)||"[Empreendimento]";
  var nCons=(dr.construtora&&dr.construtora.nome)||"[Empresa Executora]";
  var nEmpr=(dr.empreendedor&&dr.empreendedor.nome)||"[Empreendedor]";
  var numR=dr.nrel?dr.nrel+"º":"1º";
  var mes=dr.mes||"";
  var ano=dr.ano||"";
  var intro=dr.intro||"";
  var ativos=dr.ativos||[];
  var dados=dr.dados||{};
  var fotos=dr.fotos||{};
  var nomes=dr.nomes||{};
  var empr=dr.empreendedor||{};
  var cons=dr.construtora||{};
  var empt=dr.empreendimento||{};
  var equipe=dr.equipe||[];
  var lC=dr.lCons||"";
  var lE=dr.lEmpr||"";

  function esc(s){return s?String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}

  var css = "body{font-family:Arial,sans-serif;font-size:10pt;color:#222;background:#eee;margin:0}"
    + ".pg{width:210mm;min-height:297mm;margin:0 auto 8pt;background:#fff;display:flex;flex-direction:column;page-break-after:always}"
    + ".cab{display:flex;align-items:center;padding:6pt 15mm;min-height:16mm}"
    + ".cle{width:80pt;display:flex;align-items:center}"
    + ".cct{flex:1;text-align:center;padding:0 6pt}"
    + ".cri{width:80pt;display:flex;align-items:center;justify-content:flex-end}"
    + ".cimg{max-height:30pt;max-width:75pt;object-fit:contain}"
    + ".cnm{font-size:8pt;font-weight:bold;color:"+C+"}"
    + ".ctp{font-size:9pt;font-weight:bold;text-transform:uppercase}"
    + ".csb{font-size:8pt;color:#555;margin-top:2pt}"
    + ".cln{height:2pt;background:"+C+";margin:0 15mm}"
    + ".bod{flex:1;padding:8mm 15mm 4mm}"
    + ".rod{display:flex;justify-content:space-between;padding:5pt 15mm;border-top:1pt solid #ddd;font-size:7pt;color:#888;margin-top:auto}"
    + ".cap{flex:1;display:flex;flex-direction:column;align-items:center;padding:12mm 20mm 8mm}"
    + ".ctit{font-size:14pt;font-weight:bold;letter-spacing:1pt;margin-bottom:14pt}"
    + ".cptx{font-size:10pt;color:#555;text-align:center;margin-bottom:8pt}"
    + ".csp{flex:1;min-height:16pt}"
    + ".cpj{font-size:13pt;font-weight:bold;text-align:center;padding-bottom:8pt;width:100%}"
    + ".cper{font-size:10pt;color:#555;text-align:center;margin-top:8pt}"
    + ".ctec{font-size:10pt;text-align:center;line-height:1.8}"
    + ".clgs{display:flex;gap:24pt;align-items:center;justify-content:center;margin-bottom:12pt}"
    + ".clg{max-height:60px;max-width:120px;object-fit:contain}"
    + ".stit{font-size:12pt;font-weight:bold;margin-bottom:12pt;text-transform:uppercase}"
    + ".stab{width:100%;border-collapse:collapse;font-size:10pt}"
    + ".stab tr{height:18pt}"
    + ".sn{width:28pt;font-weight:bold;vertical-align:middle;padding:2pt 0}"
    + ".st{vertical-align:middle;padding:2pt 4pt}"
    + ".sd{background-image:radial-gradient(circle,#999 1px,transparent 1px);background-size:4pt 100%;background-repeat:repeat-x;background-position:0 55%}"
    + ".sp{width:18pt;text-align:right;vertical-align:middle;color:#999}"
    + ".ssb{font-style:italic;color:#555;font-size:9pt}"
    + ".sec{font-size:11pt;font-weight:bold;color:"+C+";margin-bottom:8pt;padding-bottom:3pt;text-transform:uppercase}"
    + ".ptit{font-size:10pt;font-weight:bold;margin:8pt 0 5pt;padding:4pt 8pt;background:#f5f5f5}"
    + ".sub{font-size:10pt;font-weight:bold;color:"+C+";margin:7pt 0 4pt}"
    + ".txt{font-size:10pt;line-height:1.7;color:#333;margin-bottom:5pt;text-align:justify}"
    + ".qtit{font-size:10pt;font-weight:bold;margin:7pt 0 3pt}"
    + ".qtab{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:7pt}"
    + ".qtab th{background:"+C+";color:#fff;padding:3pt 7pt;text-align:left}"
    + ".qtab td{padding:3pt 7pt;border:1pt solid #ddd}"
    + ".qtab tr.alt td{background:#f8f8f8}"
    + ".qk{font-weight:bold;color:"+C+";width:110pt}"
    + ".ftab{width:100%;border-collapse:separate;border-spacing:6pt}"
    + ".fcel{width:50%;vertical-align:top;text-align:center}"
    + ".fimg{width:100%;height:95pt;object-fit:cover;border:1pt solid #ddd}"
    + ".fleg{font-size:8pt;color:#555;text-align:center;margin-top:2pt;font-style:italic}"
    + "@media print{@page{size:A4 portrait;margin:0}body{background:#fff;margin:0}.pg{box-shadow:none;margin:0;page-break-after:always;min-height:297mm;width:210mm}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}";

  function cab() {
    var le=lC?"<img src='"+lC+"' class='cimg'/>":"<div class='cnm'>"+esc(nCons)+"</div>";
    var ri=lE?"<img src='"+lE+"' class='cimg'/>":"";
    return "<div class='cab'>"
      +"<div class='cle'>"+le+"</div>"
      +"<div class='cct'><div class='ctp'>"+esc(nEmp)+"</div><div class='csb'>"+numR+" RELATÓRIO – "+esc(mes)+"/"+esc(ano)+"</div></div>"
      +"<div class='cri'>"+ri+"</div>"
      +"</div><div class='cln'></div>";
  }

  function rod(n) {
    return "<div class='rod'><span>"+esc(nCons)+"</span><span>"+esc(nEmp)+" - "+esc(mes)+"/"+esc(ano)+"</span><span>"+n+"</span></div>";
  }

  function quad(titulo, linhas) {
    var rows=linhas.filter(function(r){return r[1];});
    if(!rows.length) return "";
    var trs=rows.map(function(r,i){
      return "<tr class='"+(i%2?"alt":"")+"'><td class='qk'>"+esc(r[0])+"</td><td>"+esc(r[1])+"</td></tr>";
    }).join("");
    return "<p class='qtit'>"+esc(titulo)+"</p>"
      +"<table class='qtab'><tr><th style='width:130pt'>Campo</th><th>Informação</th></tr>"+trs+"</table>";
  }

  // CAPA
  var tec=equipe.length>0?equipe[0]:null;
  var tecHTML=tec?"<div>"+esc(tec.nome)+"</div><div style='font-weight:bold'>"+esc(nCons)+"</div>":"<div style='font-weight:bold'>"+esc(nCons)+"</div>";
  var capa="<div class='pg'>"+cab()
    +"<div class='cap'>"
    +"<div class='ctit'>APRESENTAÇÃO</div>"
    +"<div class='cptx'>"+esc(nCons)+" apresenta a "+esc(nEmpr)+" o documento intitulado:</div>"
    +"<div class='csp'></div>"
    +"<div class='cpj'>"+esc(nEmp)+"</div>"
    +"<div class='cper'>"+esc(mes)+" de "+esc(ano)+"</div>"
    +"<div class='csp'></div>"
    +"<div class='ctec'>"+tecHTML+"</div>"
    +"</div>"
    +rod(1)+"</div>";

  // SUMÁRIO
  var sitens=[
    {n:"1",t:"IDENTIFICAÇÃO DO EMPREENDIMENTO",s:false},
    {n:"2",t:"IDENTIFICAÇÃO DA EQUIPE TÉCNICA",s:false},
    {n:"3",t:"INTRODUÇÃO",s:false}
  ];
  ativos.forEach(function(p,i){sitens.push({n:"3."+(i+1),t:p.lb,s:true});});
  sitens.push({n:"4",t:"GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS",s:false});
  var strs=sitens.map(function(it){
    var c=it.s?" class='ssb'":"";
    return "<tr><td class='sn'"+c+">"+it.n+"</td><td class='st'"+c+">"+esc(it.t)+"</td><td class='sd'></td><td class='sp'"+c+"></td></tr>";
  }).join("");
  var sumario="<div class='pg'>"+cab()
    +"<div class='bod'><h1 class='stit'>SUMÁRIO</h1>"
    +"<table class='stab'>"+strs+"</table>"
    +"</div>"+rod(2)+"</div>";

  // IDENTIFICACAO
  var ident="<div class='pg'>"+cab()+"<div class='bod'>"
    +"<h1 class='sec'>1. IDENTIFICAÇÃO DO EMPREENDIMENTO</h1>"
    +quad("Quadro 1 – Identificação do Empreendedor",[
      ["Empreendedor",empr.nome],["CNPJ",empr.cnpj],
      ["Endereco",empr.endereco],["Telefone",empr.telefone],
      ["Representante Legal",empr.rep_legal],["E-mail",empr.email]
    ])
    +quad("Quadro 2 – Identificação da "+(cons.label||"Empresa Construtora"),[
      ["Empresa",cons.nome],["CNPJ",cons.cnpj],
      ["Endereco",cons.endereco],["Telefone",cons.telefone],["E-mail",cons.email]
    ])
    +quad("Quadro 3 – Identificação do Empreendimento",[
      ["Nome do Empreendimento",empt.nome],["Estado (UF)",empt.uf]
    ])
    +"</div>"+rod(3)+"</div>";

  // EQUIPE
  var equipeHTML="";
  if(equipe.length>0){
    var etrs=equipe.map(function(m,i){
      return "<tr class='"+(i%2?"alt":"")+"'><td>"+esc(m.nome)+"</td><td>"+esc(m.função)+"</td><td>"+esc(m.registro||"N/A")+"</td></tr>";
    }).join("");
    equipeHTML="<div class='pg'>"+cab()+"<div class='bod'>"
      +"<h1 class='sec'>2. IDENTIFICAÇÃO DA EQUIPE TÉCNICA RESPONSÁVEL</h1>"
      +"<table class='qtab'><tr><th>Nome</th><th>Função</th><th>Registro</th></tr>"+etrs+"</table>"
      +"</div>"+rod(4)+"</div>";
  }

  // INTRODUÇÃO
  var iparas=intro.split("\n").filter(function(p){return p.trim();}).map(function(p){return "<p class='txt'>"+esc(p)+"</p>";}).join("");
  var introducao="<div class='pg'>"+cab()+"<div class='bod'>"
    +"<h1 class='sec'>3. INTRODUÇÃO</h1>"+iparas
    +"</div>"+rod(5)+"</div>";

  // PROGRAMAS
  var prows=ativos.map(function(p,i){
    return "<tr class='"+(i%2?"alt":"")+"'>"
      +"<td style='text-align:center;width:30pt'>"+(i+1)+"</td>"
      +"<td>"+esc(p.lb)+"</td>"
      +"<td style='color:"+C+";font-weight:bold'>Em Execucao</td>"
      +"</tr>";
  }).join("");
  var programas="<div class='pg'>"+cab()+"<div class='bod'>"
    +"<h1 class='sec'>4. PROGRAMAS EM EXECUÇÃO</h1>"
    +"<table class='qtab'><tr><th style='width:30pt'>No</th><th>Programa</th><th style='width:90pt'>Status</th></tr>"+prows+"</table>"
    +"</div>"+rod(6)+"</div>";

  // GESTAO
  var gestaoConteudo=ativos.map(function(prog,pi){
    var pd=dados[prog.id]||{};
    var pf=fotos[prog.id]||[];
    var desc=pd.descricao||pd.desc||"";
    var secTit=pi===0?"<h1 class='sec'>5. GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS</h1>":"";
    var dHTML=desc?("<h3 class='sub'>Descrição das Atividades</h3>"+desc.split("\n").filter(function(p){return p.trim();}).map(function(p){return "<p class='txt'>"+esc(p)+"</p>";}).join("")):"";
    var pares=[];
    for(var i=0;i<pf.length;i+=2) pares.push([pf[i],pf[i+1]||null]);
    var ftrs=pares.map(function(par,ri){
      var t1="<td class='fcel'><img src='"+par[0].src+"' class='fimg'/><div class='fleg'>Foto "+(ri*2+1)+(par[0].leg?" - "+esc(par[0].leg):"")+"</div></td>";
      var t2=par[1]?"<td class='fcel'><img src='"+par[1].src+"' class='fimg'/><div class='fleg'>Foto "+(ri*2+2)+(par[1].leg?" - "+esc(par[1].leg):"")+"</div></td>":"<td class='fcel'></td>";
      return "<tr>"+t1+t2+"</tr>";
    }).join("");
    var fHTML=pf.length>0?("<h3 class='sub'>"+(pi+1)+".1 Registro Fotográfico</h3><table class='ftab'>"+ftrs+"</table>"):"";
    var grafHTML="";
    var pgGrafs=(pd.graficos||[]).filter(function(g){return g.addRel&&(g.dados||[]).some(function(d){return d.l&&d.v;});});
    if(pgGrafs.length>0){
      grafHTML="<h3 class='sub'>"+(pi+1)+".2 Dados e Indicadores</h3>";
      grafHTML+=pgGrafs.map(function(gr,gi){
        var gd=(gr.dados||[]).filter(function(d){return d.l&&d.v;});
        // Calcular largura necessária para caber todos os rótulos
        var W=Math.max(500, gd.length*80),H=240,padT=30,padB=50,padL=45,padR=15;
        var barW=Math.min(50,Math.floor((W-padL-padR)/gd.length)-8);
        var maxV=Math.max.apply(null,gd.map(function(d){return parseFloat(d.v)||0;}));
        var cv=document.createElement("canvas");
        cv.width=W;cv.height=H;
        var ctx=cv.getContext("2d");
        ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
        if(gr.tipo==="pizza"){
          var W2=600,H2=320;
          cv.width=W2;cv.height=H2;
          ctx.fillStyle="#fff";ctx.fillRect(0,0,W2,H2);
          var total=gd.reduce(function(a,d){return a+(parseFloat(d.v)||0);},0);
          var angle=-Math.PI/2,cx=W2/2,cy=H2/2,r=100;
          // Desenhar fatias
          gd.forEach(function(d){
            var slice=(parseFloat(d.v)||0)/total*Math.PI*2;
            ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,angle,angle+slice);ctx.closePath();
            ctx.fillStyle=d.cor||gr.cor||C;ctx.fill();
            ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
            angle+=slice;
          });
          // Desenhar rótulos externos com linha
          angle=-Math.PI/2;
          gd.forEach(function(d){
            var val=parseFloat(d.v)||0;
            var slice=val/total*Math.PI*2;
            var mid=angle+slice/2;
            // Linha interna → externa
            var x1=cx+Math.cos(mid)*(r+5);
            var y1=cy+Math.sin(mid)*(r+5);
            var x2=cx+Math.cos(mid)*(r+28);
            var y2=cy+Math.sin(mid)*(r+28);
            var x3=cx+Math.cos(mid)*(r+35);
            var y3=cy+Math.sin(mid)*(r+35);
            ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle="#666";ctx.lineWidth=1;ctx.stroke();
            // Texto alinhado
            var pct=((val/total)*100).toFixed(0)+"%";
            var label=d.l+" ("+pct+")";
            ctx.fillStyle="#000";ctx.font="bold 10px Arial";
            ctx.textAlign=Math.cos(mid)>0?"left":"right";
            ctx.fillText(label,x3,y3);
            angle+=slice;
          });
        } else {
          var gap=Math.floor((W-padL-padR)/gd.length);
          ctx.strokeStyle="#eee";ctx.lineWidth=1;
          for(var yi=0;yi<=4;yi++){
            var yy=H-padB-(yi/4)*(H-padT-padB);
            ctx.beginPath();ctx.moveTo(padL,yy);ctx.lineTo(W-padR,yy);ctx.stroke();
            ctx.fillStyle="#333";ctx.font="10px Arial";ctx.textAlign="right";
            ctx.fillText(((maxV*yi/4)||0).toFixed(0),padL-5,yy+4);
          }
          gd.forEach(function(d,i){
            var val=parseFloat(d.v)||0;
            var bh=maxV>0?(val/maxV)*(H-padT-padB):0;
            var bx=padL+i*gap+(gap-barW)/2;
            var by=H-padB-bh;
            ctx.fillStyle=d.cor||gr.cor||C;
            ctx.beginPath();
            ctx.rect(bx,by,barW,bh);
            ctx.fill();
            ctx.fillStyle="#000";ctx.font="bold 10px Arial";ctx.textAlign="center";
            ctx.fillText(val+(gr.unidade?" "+gr.unidade:""),bx+barW/2,by-5);
            ctx.fillStyle="#000";ctx.font="10px Arial";
            ctx.fillText(d.l,bx+barW/2,H-padB+18);
          });
        }
        var imgSrc=cv.toDataURL("image/png");
        return "<div style='margin-bottom:12pt;text-align:center'>"
          +"<img src='"+imgSrc+"' style='width:90%;max-height:160pt;object-fit:contain;display:block;margin:0 auto;'/>"
          +"<p style='font-size:9pt;font-style:italic;color:#555;margin-top:4pt'>Gráfico "+(gi+1)+(gr.titulo?" - "+esc(gr.titulo):"")+"</p>"
          +(gr.texto?"<p class='txt' style='margin-top:4pt;font-style:italic'>"+esc(gr.texto)+"</p>":"")
          +"</div>";
      }).join("");
    }
    function buildTabHTML(items,secLabel){
      if(!items||!items.length) return "";
      var filtered=items.filter(function(t){return t.addRel;});
      if(!filtered.length) return "";
      var html="<h3 class='sub'>"+secLabel+"</h3>";
      html+=filtered.map(function(tb,ti){
        var heads=(tb.headers||[]).map(function(h){return "<th>"+esc(h)+"</th>";}).join("");
        var rows=(tb.cells||[]).map(function(row,ri){
          var cells=(row||[]).map(function(c){return "<td>"+esc(c)+"</td>";}).join("");
          return "<tr class='"+(ri%2?"alt":"")+"'>"+cells+"</tr>";
        }).join("");
        return "<p class='qtit'>"+esc(tb.titulo||"Item "+(ti+1))+"</p>"
          +"<table class='qtab'><tr>"+heads+"</tr>"+rows+"</table>"
          +(tb.texto?"<p class='txt' style='margin-top:4pt;font-style:italic'>"+esc(tb.texto)+"</p>":"");
      }).join("");
      return html;
    }
    var tabHTML=buildTabHTML(pd.tabelas,(pi+1)+".3 Tabelas");
    var quadHTML=buildTabHTML(pd.quadros,(pi+1)+".4 Quadros");
    return "<div style='margin-bottom:20pt'>"
      +secTit
      +"<h2 class='ptit' style='border-left:4px solid "+(prog.cor||C)+"'>"+(pi+1)+". "+esc(nomes[prog.id]||prog.lb)+"</h2>"
      +dHTML+fHTML+grafHTML+tabHTML+quadHTML
      +"</div>";
  }).join("");


  // Envolver gestao em uma unica pagina com cabecalho
  var gestaoPage = gestaoConteudo.length>0
    ? "<div class='pg'>"+cab()+"<div class='bod'>"+gestaoConteudo+"</div>"+rod(6)+"</div>"
    : "";

  // Seção de ANEXOS — todos os programas juntos no final
  var todosAnexos=[];
  var numGlobal=1;
  ativos.forEach(function(prog){
    var pd=dados[prog.id]||{};
    (pd.anexos||[]).filter(function(a){return a.addRel;}).forEach(function(ax){
      todosAnexos.push({ax:ax,prog:prog,numGlobal:numGlobal});
      numGlobal++;
    });
  });

  var anexosPage="";
  if(todosAnexos.length>0){
    var anexConteudo="<h1 class='sec'>6. ANEXOS</h1>";
    anexConteudo+=todosAnexos.map(function(item){
      var ax=item.ax; var prog=item.prog;
      var r="<div style='margin-bottom:12pt;padding:8pt 12pt;border:1pt solid #ddd;border-radius:4pt;background:#fafafa'>";
      r+="<p style='font-size:10pt;font-weight:bold;color:"+C+";margin-bottom:4pt'>Anexo "+item.numGlobal+(ax.titulo?" – "+esc(ax.titulo):"")+"</p>";
      r+="<p style='font-size:8pt;color:#888;margin-bottom:4pt'>Programa: "+esc(nomes[prog.id]||prog.lb)+"</p>";
      if(ax.descricao) r+="<p class='txt'>"+esc(ax.descricao)+"</p>";
      if(ax.link) r+="<p style='font-size:9pt;margin-top:4pt'>🔗 <a href='"+esc(ax.link)+"' style='color:#0066cc'>"+esc(ax.link)+"</a></p>";
      if(ax.arquivo) r+="<p style='font-size:9pt;margin-top:4pt'><a href='"+ax.arquivo.src+"' download='"+esc(ax.arquivo.nome)+"' style='color:#2d6a4f;text-decoration:none'>📄 "+esc(ax.arquivo.nome)+" <span style='color:#0066cc;font-size:8pt'>⬇ clique para baixar</span></a></p>";
      r+="</div>";
      return r;
    }).join("");
    anexosPage="<div class='pg'>"+cab()+"<div class='bod'>"+anexConteudo+"</div>"+rod(7)+"</div>";
  }

  return "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>"
    +"<title>Relatório MMA Field</title>"
    +"<style>"+css+"</style></head><body>"
    +capa+sumario+ident+equipeHTML+introducao+programas+gestaoPage+anexosPage
    +"</body></html>";
}

function dlWord(mes, ano) {
  var el = document.getElementById("reldoc");
  if (!el) { alert("Abra a aba Relatorio antes de baixar."); return; }
  var b = new Blob(["<html><body>" + el.innerHTML + "</body></html>"], {type:"application/msword"});
  var u = URL.createObjectURL(b);
  var a = document.createElement("a");
  a.href = u; a.download = "Relatorio_" + mes + "_" + ano + ".doc"; a.click();
  URL.revokeObjectURL(u);
}

function dlPDF(dr) {
  var html = buildRelHTML(dr);
  var blob = new Blob([html], {type:"text/html;charset=utf-8"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "Relatorio_MMA_Field.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},3000);
}
function estadoInicial(uid) {
  try { var s = localStorage.getItem(chaveSave(uid)); if (s) return JSON.parse(s); } catch(e) {}
  return null;
}

// ─────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// TELA DE NOVA SENHA (fluxo de recuperação)
// ─────────────────────────────────────────────
function NovaSenhaScreen({ onConcluido }) {
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
  const ei = {width:"100%",padding:"12px 14px",border:"1.5px solid #cdd8d3",borderRadius:9,fontSize:14,fontFamily:"Georgia,serif",background:"#fafdfb",boxSizing:"border-box",marginBottom:14,outline:"none"};
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"40px 36px",width:"100%",maxWidth:400,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <div style={{textAlign:"center",marginBottom:20,fontSize:32}}>🌿</div>
        <div style={{textAlign:"center",fontSize:20,fontWeight:"bold",color:HC,marginBottom:4}}>MMA Field</div>
        <div style={{textAlign:"center",fontSize:11,color:"#888",letterSpacing:2,textTransform:"uppercase",marginBottom:24}}>Meu Mundo Ambiental</div>
        <div style={{fontSize:15,fontWeight:"bold",color:HC,marginBottom:20,textAlign:"center"}}>Defina sua nova senha</div>
        {erro && <div style={{background:"#fff0f0",border:"1px solid #ffcccc",color:"#b00000",padding:"10px 14px",borderRadius:8,fontSize:12,marginBottom:14}}>{erro}</div>}
        {sucesso && <div style={{background:"#f0fff4",border:"1px solid #a8e6c0",color:"#1a5c35",padding:"10px 14px",borderRadius:8,fontSize:12,marginBottom:14}}>{sucesso}</div>}
        <label style={{display:"block",fontSize:10,fontWeight:"bold",color:"#5a6b60",marginBottom:5,textTransform:"uppercase",letterSpacing:0.6}}>Nova Senha</label>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Minimo 6 caracteres" style={ei} />
        <label style={{display:"block",fontSize:10,fontWeight:"bold",color:"#5a6b60",marginBottom:5,textTransform:"uppercase",letterSpacing:0.6}}>Confirmar Nova Senha</label>
        <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="Repita a nova senha" style={ei} onKeyDown={e => e.key === "Enter" && handleSalvar()} />
        <button onClick={handleSalvar} disabled={carregando} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#2d6a4f,#1a3d2b)",color:"#fff",border:"none",borderRadius:9,fontSize:14,fontWeight:"bold",fontFamily:"Georgia,serif",cursor:"pointer",marginTop:4,opacity:carregando?0.7:1}}>
          {carregando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </div>
  );
}
function AssinaturaBloqueadaScreen({status,onLogout}){
  var semLinha=!status;
  var ei={display:"block",width:"100%",padding:"13px",background:"linear-gradient(135deg,#2d6a4f,#1a3d2b)",color:"#fff",border:"none",borderRadius:9,fontSize:14,fontWeight:"bold",fontFamily:"Georgia,serif",cursor:"pointer",textAlign:"center",textDecoration:"none",boxSizing:"border-box"};
  return React.createElement("div",{style:{minHeight:"100vh",background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:16}},
    React.createElement("div",{style:{background:"#fff",borderRadius:18,padding:"40px 36px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}},
      React.createElement("div",{style:{textAlign:"center",marginBottom:20,fontSize:32}},"🌿"),
      React.createElement("div",{style:{textAlign:"center",fontSize:20,fontWeight:"bold",color:HC,marginBottom:4}},"MMA Field"),
      React.createElement("div",{style:{textAlign:"center",fontSize:11,color:"#888",letterSpacing:2,textTransform:"uppercase",marginBottom:24}},"Meu Mundo Ambiental"),
      semLinha
        ? React.createElement("div",{style:{background:"#fff8e1",border:"1px solid #ffe082",borderRadius:10,padding:"14px 16px",marginBottom:20,fontSize:13,color:"#7a5c00",lineHeight:1.5}},"Ainda nao encontramos seu pagamento. Se voce acabou de assinar, aguarde alguns minutos e atualize a pagina.")
        : React.createElement("div",{style:{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:10,padding:"14px 16px",marginBottom:20,fontSize:13,color:"#800000",lineHeight:1.5}},"Sua assinatura esta com um pagamento pendente. Regularize para voltar a acessar o MMA Field."),
      React.createElement("div",{style:{fontSize:12,color:"#555",marginBottom:16,textAlign:"center"}},"Escolha um plano para continuar:"),
      React.createElement("a",{href:"https://pay.kiwify.com.br/vHMUT8l",target:"_blank",rel:"noopener noreferrer",style:{...ei,marginBottom:10,display:"block"}},"\uD83D\uDCB3 Plano Mensal"),
      React.createElement("a",{href:"https://pay.kiwify.com.br/2ZE3qsd",target:"_blank",rel:"noopener noreferrer",style:{...ei,background:"linear-gradient(135deg,#1a5c9e,#0d3d6b)",marginBottom:20,display:"block"}},"\uD83D\uDC8E Plano Trimestral"),
      React.createElement("button",{onClick:onLogout,style:{width:"100%",padding:"10px",background:"none",border:"1px solid #ccc",borderRadius:9,fontSize:13,color:"#888",fontFamily:"Georgia,serif",cursor:"pointer"}},"Sair da conta")
    )
  );
}
export default function App() {
  const [user, setUser] = useState(null);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [statusAssinatura, setStatusAssinatura] = useState(undefined);

  useEffect(() => {
    // Limpeza única: remove as chaves antigas SEM vínculo a usuário, que
    // podem conter dados de outra conta salvos no navegador antes da correção.
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(HIST_KEY);
    } catch(e) {}
    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCarregandoAuth(false);
    });
    // Escutar mudanças de autenticação
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

  useEffect(()=>{
    if(!user){setStatusAssinatura(undefined);return;}
    setStatusAssinatura(undefined);
    supabase.from("assinaturas").select("status").eq("email",user.email).maybeSingle().then(({data,error})=>{
      if(error)console.error("assinatura:",error);
      setStatusAssinatura(data?data.status:null);
    }).catch(()=>setStatusAssinatura(null));
  },[user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatusAssinatura(undefined);
  };

  if (carregandoAuth) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#fff",fontFamily:"Georgia,serif",fontSize:16}}>🌿 Carregando...</div>
      </div>
    );
  }

  if (modoRecuperacao) {
    return <NovaSenhaScreen onConcluido={() => { setModoRecuperacao(false); setUser(null); }} />;
  }

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
  }

  if (statusAssinatura === undefined) {
    return (
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"#fff",fontFamily:"Georgia,serif",fontSize:16}}>\uD83C\uDF3F Verificando assinatura...</div>
      </div>
    );
  }

  if (statusAssinatura !== "ativa") {
    return <AssinaturaBloqueadaScreen status={statusAssinatura} onLogout={handleLogout} />;
  }

  return <AppPrincipal key={user.id} user={user} onLogout={handleLogout} />;
}

// ─────────────────────────────────────────────
// APP PRINCIPAL (conteúdo do app após login)
// ─────────────────────────────────────────────
function AppPrincipal({ user, onLogout }) {
  var ei = estadoInicial(user.id);
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
  const [empreendedor, setEmpreendedor] = useState(ei?.empreendedor || {nome:"",cnpj:"",endereco:"",telefone:"",rep_legal:"",email:""});
  const [construtora, setConstrutora]   = useState(ei?.construtora || {label:"Empresa Construtora",nome:"",cnpj:"",endereco:"",telefone:"",email:""});
  const [empreendimento, setEmpreendimento] = useState(ei?.empreendimento || {nome:"",uf:""});
  const [equipe, setEquipe]             = useState(ei?.equipe || []);
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
  const [historico, setHistorico] = useState([]);
  const [msgSalvo, setMsgSalvo] = useState("");
  const [carregandoDados, setCarregandoDados] = useState(true);
  const ref = useRef();
  const saveTimer = useRef(null);
  const ultimoSalvo = useRef(null);

  // ── Carregar dados do Supabase ao entrar ──
  useEffect(() => {
    async function carregarNuvem() {
      setCarregandoDados(true);
      const estadoNuvem = await sbCarregarEstado(user.id);
      if (estadoNuvem) {
        if (estadoNuvem.fotos)          setFotos(estadoNuvem.fotos);
        if (estadoNuvem.dados)          setDados(estadoNuvem.dados);
        if (estadoNuvem.inv)            setInv(estadoNuvem.inv);
        if (estadoNuvem.cor)            setCor(estadoNuvem.cor);
        if (estadoNuvem.lCons)          setLCons(estadoNuvem.lCons);
        if (estadoNuvem.lEmpr)          setLEmpr(estadoNuvem.lEmpr);
        if (estadoNuvem.campos)         setCampos(estadoNuvem.campos);
        if (estadoNuvem.nrel)           setNrel(estadoNuvem.nrel);
        if (estadoNuvem.mes)            setMes(estadoNuvem.mes);
        if (estadoNuvem.ano)            setAno(estadoNuvem.ano);
        if (estadoNuvem.pAtiv)          setPAtiv(estadoNuvem.pAtiv);
        if (estadoNuvem.pCust)          setPCust(estadoNuvem.pCust);
        if (estadoNuvem.nomes)          setNomes(estadoNuvem.nomes);
        if (estadoNuvem.extras)         setExtras(estadoNuvem.extras);
        if (estadoNuvem.intro)          setIntro(estadoNuvem.intro);
        if (estadoNuvem.empreendedor)   setEmpreendedor(estadoNuvem.empreendedor);
        if (estadoNuvem.construtora)    setConstrutora(estadoNuvem.construtora);
        if (estadoNuvem.empreendimento) setEmpreendimento(estadoNuvem.empreendimento);
        if (estadoNuvem.equipe)         setEquipe(estadoNuvem.equipe);
      }
      const histNuvem = await sbCarregarHistorico(user.id);
      if (histNuvem.length > 0) {
        setHistorico(histNuvem);
      } else {
        try {
          var h = localStorage.getItem(chaveHist(user.id));
          if (h) {
            var rels = JSON.parse(h);
            var limite = new Date(); limite.setDate(limite.getDate() - 40);
            setHistorico(rels.filter(function(r){ return !r.dataISO || new Date(r.dataISO) > limite; }));
          }
        } catch(e) {}
      }
      setCarregandoDados(false);
    }
    carregarNuvem();
  }, [user.id]);

  // Aviso ao sair sem salvar
  useEffect(() => {
    var handler = function(e) {
      var msg = "Você tem alterações não salvas. Salve o relatório antes de sair.";
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // ── Auto-salvar no Supabase ──
  useEffect(() => {
    if (carregandoDados) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async function() {
      try {
        var estado = {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,empreendedor,construtora,empreendimento,equipe};
        localStorage.setItem(chaveSave(user.id), JSON.stringify(estado));
        await sbSalvarEstado(user.id, estado);
        setMsgSalvo("✅ Salvo automaticamente");
        setTimeout(function() { setMsgSalvo(""); }, 2000);
      } catch(e) {}
    }, 1500);
  }, [fotos,dados,inv,cor,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,empreendedor,construtora,empreendimento,equipe]);

  const salvarRelatorio = async () => {
    var rel = {
      id: Date.now(), mes, ano, nrel,
      titulo: (nrel?nrel+"º ":"")+"Relatório – "+mes+"/"+ano,
      empresa: campos.find(c=>c.id==="f1")?.val||"",
      empreendimento: campos.find(c=>c.id==="f3")?.val||"",
      data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"}),
      dataISO: new Date().toISOString(),
      estado: {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,empreendedor,construtora,empreendimento,equipe}
    };
    const sbId = await sbSalvarNoHistorico(user.id, rel);
    if (sbId) rel._sbId = sbId;
    var nh = [rel,...historico];
    setHistorico(nh);
    try { localStorage.setItem(chaveHist(user.id), JSON.stringify(nh)); } catch(e) {}
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
    setEmpreendedor(e.empreendedor||{nome:"",cnpj:"",endereco:"",telefone:"",rep_legal:"",email:""});
    setConstrutora(e.construtora||{label:"Empresa Construtora",nome:"",cnpj:"",endereco:"",telefone:"",email:""});
    setEmpreendimento(e.empreendimento||{nome:"",uf:""});
    setEquipe(e.equipe||[]);
    setAba("relatorio");
    alert("Relatório de "+rel.mes+"/"+rel.ano+" carregado!");
  };
  const excluirRelatorio = async (id) => {
    if (!window.confirm("Excluir este relatório?")) return;
    var rel = historico.find(r=>r.id===id);
    if (rel?._sbId) await sbExcluirDoHistorico(rel._sbId);
    var nh = historico.filter(r=>r.id!==id);
    setHistorico(nh);
    try { localStorage.setItem(chaveHist(user.id), JSON.stringify(nh)); } catch(e) {}
  };
  const baixarRelatorio = (rel) => {
    carregarRelatorio(rel);
    setTimeout(function() { setAba("relatorio"); setTimeout(function() { dlWord(rel.mes, rel.ano); }, 800); }, 500);
  };
  const novoRelatorio = () => {
    if (!window.confirm("Iniciar novo relatório?")) return;
    setFotos({}); setDados({}); setInv([]); setCor(HC); setLCons(null); setLEmpr(null);
    setCampos([{id:"f1",lb:"Empresa Executora",val:"",ed:false},{id:"f2",lb:"Empreendedor",val:"",ed:false},{id:"f3",lb:"Nome do Empreendimento",val:"",ed:false},{id:"f4",lb:"Estado (UF)",val:"",ed:false},{id:"f5",lb:"Responsável Técnico",val:"",ed:false}]);
    setNrel(""); setMes("Janeiro"); setAno("2026"); setPAtiv(PRG.map(p=>p.id));
    setPCust([]); setNomes({}); setExtras([]); setIntro(INTRO_DEFAULT);
    setEmpreendedor({nome:"",cnpj:"",endereco:"",telefone:"",rep_legal:"",email:""});
    setConstrutora({label:"Empresa Construtora",nome:"",cnpj:"",endereco:"",telefone:"",email:""});
    setEmpreendimento({nome:"",uf:""});
    setEquipe([]);
    setAba("fotos");
  };
  const todos  = [...PRG,...pCust];
  const ativos = todos.filter(p=>pAtiv.includes(p.id));
  const getL   = id => nomes[id]||todos.find(p=>p.id===id)?.lb||id;
  const numR   = nrel ? nrel.replace(/º/gi,"")+"º" : "Nº";
  const nEmp   = campos.find(c=>c.id==="f3")?.val||"";
  const emp    = campos.find(c=>c.id==="f1")?.val||"";
  const updC   = (id,p) => setCampos(cs=>cs.map(c=>c.id===id?{...c,...p}:c));
  const setLogo= (fn,f) => { var r=new FileReader(); r.onload=e=>fn(e.target.result); r.readAsDataURL(f); };
  const getD   = id => dados[id]||{desc:"",graficos:[],tabelas:[],quadros:[],anexos:[],cor:PRG.find(p=>p.id===id)?.cor||"#2d6a4f"};
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
      {lCons?<img src={lCons} alt="" style={{height:38,objectFit:"contain"}}/>:<div style={{width:90,height:38,background:"#eee",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#aaa"}}>Logo</div>}
      <div style={{textAlign:"center",fontSize:9,color:"#444",lineHeight:1.7}}>
        <strong>{numR} RELATÓRIO – {mes.toUpperCase()}/{ano}</strong><br/>GESTÃO E SUPERVISÃO AMBIENTAL<br/>{nEmp||"—"}
      </div>
      {lEmpr?<img src={lEmpr} alt="" style={{height:38,objectFit:"contain"}}/>:<div style={{width:90,height:38,background:"#eee",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#aaa"}}>Logo</div>}
    </div>
  );
  const renderGráfico = (gr, height, forReport) => {
    var gd2=(gr.dados||[]).filter(x=>x.l&&x.v);
    if(gd2.length===0) return null;
    var chartData = gd2.map(g=>({name:g.l,val:Number(g.v),fill:g.cor||gr.cor||"#2d6a4f"}));
    var showLeg = gr.legenda !== false;
    return (
      <div>
        <ResponsiveContainer width="100%" height={height||200}>
          {gr.tipo==="pizza"
            ?<PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={65} dataKey="val"
                  label={({name,value,percent})=>name+": "+value+(gr.unidade?" "+gr.unidade:"")+" ("+(percent*100).toFixed(0)+"%)"}
                  labelLine={{stroke:"#555"}}
                  labelStyle={{fontSize:10,fontWeight:"bold",fill:"#000"}}>
                  {chartData.map((d,i)=><Cell key={i} fill={d.fill} stroke="#fff" strokeWidth={2}/>)}
                </Pie>
                <Tooltip formatter={(v,n)=>[v+(gr.unidade?" "+gr.unidade:""),n]}/>
              </PieChart>
            :<BarChart data={chartData} margin={{top:20,right:10,left:0,bottom:chartData.length>4?45:10}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:9,fill:"#000"}} angle={chartData.length>4?-35:0} textAnchor={chartData.length>4?"end":"middle"} interval={0}/>
              <YAxis tick={{fontSize:9,fill:"#000"}} unit={gr.unidade?" "+gr.unidade:""}/>
              <Tooltip formatter={v=>[v+(gr.unidade?" "+gr.unidade:""),"Valor"]}/>
              <Bar dataKey="val" radius={[4,4,0,0]} maxBarSize={60}>
                {chartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                <LabelList dataKey="val" position="top" style={{fontSize:10,fontWeight:"bold",fill:"#000"}} formatter={v=>v+(gr.unidade?" "+gr.unidade:"")}/>
              </Bar>
            </BarChart>}
        </ResponsiveContainer>
        {showLeg&&(
          <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:"4px 12px",justifyContent:"center"}}>
            {chartData.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#000"}}>
                <div style={{width:12,height:12,borderRadius:3,background:d.fill,flexShrink:0}}/>
                <span>{d.name}{gr.unidade?" ("+gr.unidade+")":""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const ABS = [{id:"fotos",lb:"📷 Registro Fotográfico"},{id:"dados",lb:"📊 Dados"},{id:"config",lb:"⚙️ Configurar"},{id:"relatorio",lb:"📄 Relatório"},{id:"historico",lb:"📁 Histórico"}];
  return (
    <div style={{minHeight:"100vh",background:"#eef1ee",fontFamily:"Georgia,serif"}}>
      <header style={{background:"linear-gradient(135deg,#1a3d2b,#2d6a4f)",boxShadow:"0 3px 16px rgba(0,0,0,0.25)",position:"fixed",top:0,left:0,right:0,zIndex:100}}>
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
            <span style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>👤 {user.email}</span>
            <button onClick={salvarRelatorio} style={{background:"#2d6a4f",color:"#fff",border:"2px solid #a8e6c0",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>💾 Salvar Relatório</button>
            <button onClick={novoRelatorio} style={{background:"transparent",color:"#fff",border:"2px solid rgba(255,255,255,0.4)",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12}}>+ Novo</button>
            <button onClick={()=>{if(window.confirm("Tem certeza que deseja sair?\nSalve o relatório antes de sair para não perder dados."))onLogout();}} style={{background:"transparent",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11}}>Sair</button>
          </div>
        </div>
        <nav style={{maxWidth:1100,margin:"0 auto",display:"flex",paddingLeft:18}}>
          {ABS.map(t=>(
            <button key={t.id} onClick={()=>setAba(t.id)} style={{background:aba===t.id?"#eef1ee":"transparent",color:aba===t.id?HC:"rgba(255,255,255,0.85)",border:"none",padding:"9px 20px",borderRadius:"8px 8px 0 0",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:aba===t.id?"bold":"normal"}}>
              {t.lb}
            </button>
          ))}
        </nav>
      </header>
      <main style={{maxWidth:1100,margin:"0 auto",padding:"20px",paddingTop:"110px"}}>
        {carregandoDados && (
          <div style={{textAlign:"center",padding:"40px",color:"#2d6a4f",fontSize:14}}>
            🌿 Carregando seus dados da nuvem...
          </div>
        )}
        {/* FOTOS */}
        {aba==="fotos"&&(
          <div>
            <h2 style={{color:HC,marginBottom:18}}>📷 Registro Fotográfico</h2>
            <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:18,alignItems:"start"}}>
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
                <label style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"14px 8px",border:"2px dashed #a8c5b5",borderRadius:10,cursor:"pointer",background:"#f8fdf9",marginBottom:8}}>
                  <span style={{fontSize:22}}>🖼️</span>
                  <span style={{fontSize:11,color:"#2d6a4f",fontWeight:"bold"}}>Selecionar Foto</span>
                  <span style={{fontSize:10,color:"#888"}}>Clique para escolher da galeria</span>
                  <input ref={ref} type="file" accept="image/*" onChange={onFoto} style={{display:"none"}}/>
                </label>
                {prev&&<img src={prev} alt="" style={{width:"100%",height:150,objectFit:"cover",borderRadius:9,border:"2px solid #2d6a4f",marginBottom:10}}/>}

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
                          <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                            <div><label style={LB}>Tipo</label><select value={gr.tipo||"barra"} onChange={e=>setGr({tipo:e.target.value})} style={{...SI,width:110}}><option value="barra">Barras</option><option value="pizza">Pizza</option></select></div>
                            <div><label style={LB}>Unidade de Medida</label><select value={gr.unidade||""} onChange={e=>setGr({unidade:e.target.value})} style={{...SI,width:140}}><option value="">Sem unidade</option><option value="t">Tonelada (t)</option><option value="kg">kg</option><option value="m">Metro (m)</option><option value="m2">m²</option><option value="m3">m³</option><option value="L">Litros (L)</option><option value="un">Unidade (un)</option><option value="%">Percentual (%)</option></select></div>
                            <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:"#f5fdf7",borderRadius:8,border:"1px solid #c8ddd2",cursor:"pointer"}} onClick={()=>setGr({legenda:gr.legenda===false?true:false})}>
                              <input type="checkbox" checked={gr.legenda!==false} onChange={()=>setGr({legenda:gr.legenda===false?true:false})} style={{width:14,height:14,accentColor:p.cor,cursor:"pointer"}}/>
                              <span style={{fontSize:11,color:"#5a6b60",fontWeight:"bold",userSelect:"none"}}>Exibir Legenda</span>
                            </div>
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
                            <div data-graf-id={gr.id} style={{marginTop:8,padding:10,background:"#fff",borderRadius:8,border:"1px solid #e8e8e8"}}>
                              {renderGráfico(gr, 200, false)}
                              <div style={{textAlign:"center",fontSize:10,color:"#888",marginTop:6,fontStyle:"italic"}}>
                                Gráfico {(d.graficos||[]).indexOf(gr)+1}{gr.titulo?" – "+gr.titulo:""}
                              </div>
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
                  {/* TABELA */}
                  <div style={CD}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div>
                        <h3 style={{color:p.cor,fontSize:13,margin:0}}>📋 Tabela</h3>
                        <div style={{fontSize:10,color:"#888",marginTop:2}}>Dados numéricos e estatísticos.</div>
                      </div>
                      <button onClick={()=>{
                        var cols=parseInt(window.prompt("Quantas colunas?","3")||"3");
                        var rows=parseInt(window.prompt("Quantas linhas?","3")||"3");
                        if(cols>0&&rows>0){
                          var headers=Array.from({length:cols},function(_,i){return "Coluna "+(i+1);});
                          var cells=Array.from({length:rows},function(){return Array(cols).fill("");});
                          var t={id:Date.now(),titulo:"Nova Tabela",tipo:"tabela",headers:headers,cells:cells,addRel:false};
                          set({tabelas:[...(d.tabelas||[]),t]});
                        }
                      }} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Tabela</button>
                    </div>
                    {(d.tabelas||[]).length===0&&<div style={{textAlign:"center",padding:"20px",color:"#bbb",fontSize:12,border:"2px dashed #e0e0e0",borderRadius:10}}>Nenhuma tabela ainda. Clique em "+ Adicionar Tabela".</div>}
                    {(d.tabelas||[]).map((tb,ti)=>{
                      var setTb=patch=>{var arr=[...(d.tabelas||[])];arr[ti]={...arr[ti],...patch};set({tabelas:arr});};
                      var remTb=()=>set({tabelas:(d.tabelas||[]).filter((_,j)=>j!==ti)});
                      var corCab=p.cor;
                      return(
                        <div key={tb.id} style={{border:"2px solid "+(tb.addRel?cor+"88":cor+"33"),borderRadius:10,padding:14,marginBottom:14,background:tb.addRel?"#f5fdf7":"#fafdfb"}}>
                          <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                            <input value={tb.titulo||""} onChange={e=>setTb({titulo:e.target.value})} placeholder="Título da tabela" style={{...SI,flex:1,fontWeight:"bold",fontSize:13}}/>
                            <button onClick={remTb} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>Remover</button>
                          </div>
                          <div style={{overflowX:"auto"}}>
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                              <thead><tr>
                                {(tb.headers||[]).map((h,hi)=>(
                                  <th key={hi} style={{background:cor,color:"#fff",padding:"6px 8px",border:"1px solid #ddd"}}>
                                    <input value={h} onChange={e=>{var hs=[...(tb.headers||[])];hs[hi]=e.target.value;setTb({headers:hs});}} style={{background:"transparent",border:"none",color:"#fff",fontWeight:"bold",fontSize:11,fontFamily:"Georgia,serif",width:"100%",outline:"none",textAlign:"center"}}/>
                                  </th>
                                ))}
                              </tr></thead>
                              <tbody>
                                {(tb.cells||[]).map((row,ri)=>(
                                  <tr key={ri} style={{background:ri%2?"#f8fdf9":"#fff"}}>
                                    {(row||[]).map((cell,ci)=>(
                                      <td key={ci} style={{padding:"5px 8px",border:"1px solid #e0e0e0"}}>
                                        <input value={cell||""} onChange={e=>{var cs=(tb.cells||[]).map(function(r){return [...r];});cs[ri][ci]=e.target.value;setTb({cells:cs});}} style={{width:"100%",border:"none",background:"transparent",fontSize:11,fontFamily:"Georgia,serif",outline:"none"}}/>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div style={{marginTop:10}}>
                            <label style={{...LB,marginBottom:4}}>TEXTO INTERPRETATIVO (VAI PARA O RELATÓRIO)</label>
                            <textarea value={tb.texto||""} onChange={e=>setTb({texto:e.target.value})} rows={3} placeholder="Ex: Os dados acima demonstram que..." style={{...SI,resize:"vertical",fontSize:12}}/>
                          </div>
                          <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{fontSize:11,color:"#888"}}>{tb.addRel?"✅ Salvo no relatório":"⬜ Não incluído no relatório"}</div>
                            <button onClick={()=>setTb({addRel:!tb.addRel})} style={{background:tb.addRel?"#2d6a4f":cor,color:"#fff",border:"none",borderRadius:8,padding:"7px 18px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>
                              {tb.addRel?"✓ Salvo no Relatório":"💾 Salvar no Relatório"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* QUADRO */}
                  <div style={CD}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <div>
                        <h3 style={{color:p.cor,fontSize:13,margin:0}}>🟦 Quadro</h3>
                        <div style={{fontSize:10,color:"#888",marginTop:2}}>Informações textuais e descritivas.</div>
                      </div>
                      <button onClick={()=>{
                        var cols=parseInt(window.prompt("Quantas colunas?","3")||"3");
                        var rows=parseInt(window.prompt("Quantas linhas?","3")||"3");
                        if(cols>0&&rows>0){
                          var headers=Array.from({length:cols},function(_,i){return "Coluna "+(i+1);});
                          var cells=Array.from({length:rows},function(){return Array(cols).fill("");});
                          var t={id:Date.now(),titulo:"Nova Quadro",tipo:"quadro",headers:headers,cells:cells,addRel:false};
                          set({quadros:[...(d.quadros||[]),t]});
                        }
                      }} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Quadro</button>
                    </div>
                    {(d.quadros||[]).length===0&&<div style={{textAlign:"center",padding:"20px",color:"#bbb",fontSize:12,border:"2px dashed #e0e0e0",borderRadius:10}}>Nenhuma quadro ainda. Clique em "+ Adicionar Quadro".</div>}
                    {(d.quadros||[]).map((tb,ti)=>{
                      var setTb=patch=>{var arr=[...(d.quadros||[])];arr[ti]={...arr[ti],...patch};set({quadros:arr});};
                      var remTb=()=>set({quadros:(d.quadros||[]).filter((_,j)=>j!==ti)});
                      var corCab="#1a3d2b";
                      return(
                        <div key={tb.id} style={{border:"2px solid "+(tb.addRel?cor+"88":cor+"33"),borderRadius:10,padding:14,marginBottom:14,background:tb.addRel?"#f5fdf7":"#fafdfb"}}>
                          <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
                            <input value={tb.titulo||""} onChange={e=>setTb({titulo:e.target.value})} placeholder="Título da quadro" style={{...SI,flex:1,fontWeight:"bold",fontSize:13}}/>
                            <button onClick={remTb} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>Remover</button>
                          </div>
                          <div style={{overflowX:"auto"}}>
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                              <thead><tr>
                                {(tb.headers||[]).map((h,hi)=>(
                                  <th key={hi} style={{background:cor,color:"#fff",padding:"6px 8px",border:"1px solid #ddd"}}>
                                    <input value={h} onChange={e=>{var hs=[...(tb.headers||[])];hs[hi]=e.target.value;setTb({headers:hs});}} style={{background:"transparent",border:"none",color:"#fff",fontWeight:"bold",fontSize:11,fontFamily:"Georgia,serif",width:"100%",outline:"none",textAlign:"center"}}/>
                                  </th>
                                ))}
                              </tr></thead>
                              <tbody>
                                {(tb.cells||[]).map((row,ri)=>(
                                  <tr key={ri} style={{background:ri%2?"#f8fdf9":"#fff"}}>
                                    {(row||[]).map((cell,ci)=>(
                                      <td key={ci} style={{padding:"5px 8px",border:"1px solid #e0e0e0"}}>
                                        <input value={cell||""} onChange={e=>{var cs=(tb.cells||[]).map(function(r){return [...r];});cs[ri][ci]=e.target.value;setTb({cells:cs});}} style={{width:"100%",border:"none",background:"transparent",fontSize:11,fontFamily:"Georgia,serif",outline:"none"}}/>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div style={{marginTop:10}}>
                            <label style={{...LB,marginBottom:4}}>TEXTO INTERPRETATIVO (VAI PARA O RELATÓRIO)</label>
                            <textarea value={tb.texto||""} onChange={e=>setTb({texto:e.target.value})} rows={3} placeholder="Ex: O quadro acima apresenta..." style={{...SI,resize:"vertical",fontSize:12}}/>
                          </div>
                          <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{fontSize:11,color:"#888"}}>{tb.addRel?"✅ Salvo no relatório":"⬜ Não incluído no relatório"}</div>
                            <button onClick={()=>setTb({addRel:!tb.addRel})} style={{background:tb.addRel?"#2d6a4f":cor,color:"#fff",border:"none",borderRadius:8,padding:"7px 18px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>
                              {tb.addRel?"✓ Salvo no Relatório":"💾 Salvar no Relatório"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                                    {/* MAPAS/FIGURAS */}
                  <div style={CD}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <h3 style={{color:p.cor,fontSize:13,margin:0}}>🗺️ Mapas / Figuras</h3>
                      <button onClick={()=>{var mf=[...(d.mapas||[])];mf.push({id:Date.now(),numero:mf.length+1,tipo:"Mapa",legenda:"",textoint:"",arquivo:null,addRel:false});set({mapas:mf});}} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Mapa/Figura</button>
                    </div>
                    {(d.mapas||[]).length===0&&<div style={{textAlign:"center",padding:"20px",color:"#bbb",fontSize:12,border:"2px dashed #e0e0e0",borderRadius:10}}>Nenhum mapa/figura ainda. Clique em "+ Adicionar Mapa/Figura".</div>}
                    {(d.mapas||[]).map((mf,mi)=>{var setMf=patch=>{var arr=[...(d.mapas||[])];arr[mi]={...arr[mi],...patch};set({mapas:arr});}; var remMf=()=>{var arr=(d.mapas||[]).filter((_,j)=>j!==mi).map((a,i)=>({...a,numero:i+1}));set({mapas:arr});};return(<div key={mf.id} style={{border:"2px solid "+(mf.addRel?p.cor+"88":p.cor+"33"),borderRadius:10,padding:14,marginBottom:12,background:mf.addRel?"#f5fdf7":"#fafdfb"}}><div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><div style={{background:p.cor,color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:"bold",flexShrink:0}}>{mf.tipo} {mf.numero}</div><select value={mf.tipo||"Mapa"} onChange={e=>setMf({tipo:e.target.value})} style={{...SI,width:110,flexShrink:0}}><option>Mapa</option><option>Figura</option></select><button onClick={remMf} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12,marginLeft:"auto",flexShrink:0}}>Remover</button></div><div style={{marginBottom:8}}><label style={LB}>Arquivo (JPG, PNG ou PDF)</label><input type="file" accept="application/pdf,image/*" onChange={e=>{var f=e.target.files[0];if(!f)return;var reader=new FileReader();reader.onload=ev=>setMf({arquivo:{nome:f.name,src:ev.target.result,tipo:f.type}});reader.readAsDataURL(f);e.target.value="";}}/>{mf.arquivo&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,padding:"6px 10px",background:"#e8f5ee",borderRadius:6}}>{mf.arquivo.tipo&&mf.arquivo.tipo.startsWith("image/")&&<img src={mf.arquivo.src} alt="preview" style={{width:60,height:40,objectFit:"cover",borderRadius:4,border:"1px solid #ccc"}}/>}<a href={mf.arquivo.src} download={mf.arquivo.nome} style={{fontSize:11,color:"#2d6a4f",textDecoration:"none"}}>📄 {mf.arquivo.nome}</a><button onClick={()=>setMf({arquivo:null})} style={{background:"none",border:"none",color:"#b5451b",cursor:"pointer",fontSize:13,marginLeft:"auto"}}>×</button></div>}</div><div style={{marginBottom:8}}><label style={LB}>Texto Interpretativo</label><textarea value={mf.textoint||""} onChange={e=>setMf({textoint:e.target.value})} rows={3} placeholder="Descreva e interprete o mapa/figura..." style={{...SI,resize:"vertical",fontSize:12}}/></div><div style={{marginBottom:10}}><label style={LB}>Legenda</label><input value={mf.legenda||""} onChange={e=>setMf({legenda:e.target.value})} placeholder="Legenda do mapa/figura..." style={SI}/></div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:"#888"}}>{mf.addRel?"✅ Salvo no relatório":"⬜ Não incluído no relatório"}</div><button onClick={()=>setMf({addRel:!mf.addRel})} style={{background:mf.addRel?"#2d6a4f":p.cor,color:"#fff",border:"none",borderRadius:8,padding:"7px 18px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>{mf.addRel?"✓ Salvo no Relatório":"💾 Salvar no Relatório"}</button></div></div>);})}
                  </div>
                  {/* ANEXOS */}
                  <div style={CD}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                      <h3 style={{color:p.cor,fontSize:13,margin:0}}>📎 Anexos</h3>
                      <button onClick={()=>{
                        var ax=[...(d.anexos||[])];
                        var num=ax.length+1;
                        ax.push({id:Date.now(),numero:num,titulo:"",descricao:"",link:"",arquivo:null,addRel:false});
                        set({anexos:ax});
                      }} style={{background:p.cor,color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontWeight:"bold"}}>+ Adicionar Anexo</button>
                    </div>
                    {(d.anexos||[]).length===0&&<div style={{textAlign:"center",padding:"20px",color:"#bbb",fontSize:12,border:"2px dashed #e0e0e0",borderRadius:10}}>Nenhum anexo ainda. Clique em "+ Adicionar Anexo".</div>}
                    {(d.anexos||[]).map((ax,ai)=>{
                      var setAx=patch=>{var arr=[...(d.anexos||[])];arr[ai]={...arr[ai],...patch};set({anexos:arr});};
                      var remAx=()=>{var arr=(d.anexos||[]).filter((_,j)=>j!==ai).map((a,i)=>({...a,numero:i+1}));set({anexos:arr});};
                      return(
                        <div key={ax.id} style={{border:"2px solid "+(ax.addRel?p.cor+"88":p.cor+"33"),borderRadius:10,padding:14,marginBottom:12,background:ax.addRel?"#f5fdf7":"#fafdfb"}}>
                          <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                            <div style={{background:p.cor,color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:"bold",flexShrink:0}}>Anexo {ax.numero}</div>
                            <input value={ax.titulo||""} onChange={e=>setAx({titulo:e.target.value})} placeholder="Título do anexo..." style={{...SI,flex:1,fontWeight:"bold"}}/>
                            <button onClick={remAx} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12,flexShrink:0}}>Remover</button>
                          </div>
                          <div style={{marginBottom:8}}>
                            <label style={LB}>Descrição</label>
                            <textarea value={ax.descricao||""} onChange={e=>setAx({descricao:e.target.value})} rows={2} placeholder="Descreva o conteúdo do anexo..." style={{...SI,resize:"vertical",fontSize:12}}/>
                          </div>
                          <div style={{marginBottom:8}}>
                            <label style={LB}>Link da Pasta / Drive (opcional)</label>
                            <input value={ax.link||""} onChange={e=>setAx({link:e.target.value})} placeholder="https://drive.google.com/..." style={SI}/>
                          </div>
                          <div style={{marginBottom:10}}>
                            <label style={LB}>Arquivo PDF (opcional)</label>
                            <input type="file" accept="application/pdf,image/*" onChange={e=>{
                              var f=e.target.files[0];
                              if(!f) return;
                              var reader=new FileReader();
                              reader.onload=ev=>setAx({arquivo:{nome:f.name,src:ev.target.result}});
                              reader.readAsDataURL(f);
                              e.target.value="";
                            }} style={{...SI,padding:"5px",border:"2px dashed #a8c5b5",cursor:"pointer"}}/>
                            {ax.arquivo&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,padding:"6px 10px",background:"#e8f5ee",borderRadius:6}}>
                              <a href={ax.arquivo.src} download={ax.arquivo.nome} style={{fontSize:11,color:"#2d6a4f",textDecoration:"none",display:"flex",alignItems:"center",gap:4}}>📄 {ax.arquivo.nome} <span style={{fontSize:10,color:"#0066cc"}}>⬇ baixar</span></a>
                              <button onClick={()=>setAx({arquivo:null})} style={{background:"none",border:"none",color:"#b5451b",cursor:"pointer",fontSize:13,marginLeft:"auto"}}>×</button>
                            </div>}
                          </div>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{fontSize:11,color:"#888"}}>{ax.addRel?"✅ Salvo no relatório":"⬜ Não incluído no relatório"}</div>
                            <button onClick={()=>setAx({addRel:!ax.addRel})} style={{background:ax.addRel?"#2d6a4f":p.cor,color:"#fff",border:"none",borderRadius:8,padding:"7px 18px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>
                              {ax.addRel?"✓ Salvo no Relatório":"💾 Salvar no Relatório"}
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
                    {/* INTRODUÇÃO */}
                    <div style={{background:"#2d6a4f",borderRadius:"8px 8px 0 0",padding:"8px 12px",marginBottom:0}}>
                      <h4 style={{color:"#fff",fontSize:12,margin:0}}>📝 Introdução do Relatório</h4>
                    </div>
                    <div style={{border:"1px solid #2d6a4f",borderTop:"none",borderRadius:"0 0 8px 8px",padding:10,marginBottom:12}}>
                      <textarea value={intro} onChange={e=>setIntro(e.target.value)} rows={5} placeholder="Escreva a introdução do relatório..." style={{...SI,fontSize:12,lineHeight:1.8,color:"#444",resize:"vertical"}}/>
                    </div>

                    {/* EMPREENDEDOR */}
                    <div style={{background:"#2d6a4f",borderRadius:"8px 8px 0 0",padding:"8px 12px",marginBottom:0}}>
                      <h4 style={{color:"#fff",fontSize:12,margin:0}}>🏢 Identificação do Empreendedor</h4>
                    </div>
                    <div style={{border:"1px solid #2d6a4f",borderTop:"none",borderRadius:"0 0 8px 8px",padding:10,marginBottom:12}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {[["nome","Nome / Razão Social"],["cnpj","CNPJ"],["endereco","Endereço"],["telefone","Telefone"],["rep_legal","Representante Legal"],["email","E-mail"]].map(([k,lb])=>(
                          empreendedor["_hide_"+k] ? null :
                          <div key={k} style={{position:"relative"}}>
                            <label style={LB}>{lb}</label>
                            <div style={{display:"flex",gap:4}}>
                              <input value={empreendedor[k]||""} onChange={e=>setEmpreendedor(x=>({...x,[k]:e.target.value}))} style={{...SI,flex:1}}/>
                              <button onClick={()=>setEmpreendedor(x=>({...x,["_hide_"+k]:true}))} title="Remover do relatório" style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"0 7px",cursor:"pointer",fontSize:13,flexShrink:0}}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>setEmpreendedor(x=>{var n={...x};["nome","cnpj","endereco","telefone","rep_legal","email"].forEach(k=>delete n["_hide_"+k]);return n;})} style={{marginTop:8,background:"none",border:"1px solid #c8ddd2",color:"#2d6a4f",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10}}>↺ Restaurar campos ocultos</button>
                    </div>

                    {/* CONSTRUTORA */}
                    <div style={{background:"#2d6a4f",borderRadius:"8px 8px 0 0",padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                      <h4 style={{color:"#fff",fontSize:12,margin:0}}>🏗️</h4>
                      <input value={construtora.label||"Empresa Construtora"} onChange={e=>setConstrutora(x=>({...x,label:e.target.value}))} placeholder="Empresa Construtora / Consultoria..." style={{background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,0.5)",color:"#fff",fontSize:12,fontWeight:"bold",fontFamily:"Georgia,serif",outline:"none",flex:1}} title="Clique para editar"/>
                    </div>
                    <div style={{border:"1px solid #2d6a4f",borderTop:"none",borderRadius:"0 0 8px 8px",padding:10,marginBottom:12}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {[["nome","Nome / Razão Social"],["cnpj","CNPJ"],["endereco","Endereço"],["telefone","Telefone"],["email","E-mail"]].map(([k,lb])=>(
                          construtora["_hide_"+k] ? null :
                          <div key={k}>
                            <label style={LB}>{lb}</label>
                            <div style={{display:"flex",gap:4}}>
                              <input value={construtora[k]||""} onChange={e=>setConstrutora(x=>({...x,[k]:e.target.value}))} style={{...SI,flex:1}}/>
                              <button onClick={()=>setConstrutora(x=>({...x,["_hide_"+k]:true}))} title="Remover do relatório" style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"0 7px",cursor:"pointer",fontSize:13,flexShrink:0}}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>setConstrutora(x=>{var n={...x};["nome","cnpj","endereco","telefone","email"].forEach(k=>delete n["_hide_"+k]);return n;})} style={{marginTop:8,background:"none",border:"1px solid #c8ddd2",color:"#2d6a4f",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10}}>↺ Restaurar campos ocultos</button>
                    </div>

                    {/* EMPREENDIMENTO */}
                    <div style={{background:"#2d6a4f",borderRadius:"8px 8px 0 0",padding:"8px 12px"}}>
                      <h4 style={{color:"#fff",fontSize:12,margin:0}}>📍 Identificação do Empreendimento</h4>
                    </div>
                    <div style={{border:"1px solid #2d6a4f",borderTop:"none",borderRadius:"0 0 8px 8px",padding:10,marginBottom:12}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {[["nome","Nome do Empreendimento"],["uf","Estado (UF)"]].map(([k,lb])=>(
                          empreendimento["_hide_"+k] ? null :
                          <div key={k}>
                            <label style={LB}>{lb}</label>
                            <div style={{display:"flex",gap:4}}>
                              <input value={empreendimento[k]||""} onChange={e=>setEmpreendimento(x=>({...x,[k]:e.target.value}))} style={{...SI,flex:1}}/>
                              <button onClick={()=>setEmpreendimento(x=>({...x,["_hide_"+k]:true}))} title="Remover do relatório" style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"0 7px",cursor:"pointer",fontSize:13,flexShrink:0}}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <h4 style={{color:"#2d6a4f",fontSize:12,margin:0}}>👷 Equipe Técnica</h4>
                      <button onClick={()=>setEquipe(eq=>[...eq,{id:Date.now(),nome:"",função:"",registro:""}])} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 11px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:10,fontWeight:"bold"}}>+ Membro</button>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginBottom:4}}>
                      <thead><tr><th style={{...TH,background:"#2d6a4f"}}>Nome</th><th style={{...TH,background:"#2d6a4f"}}>Função</th><th style={{...TH,background:"#2d6a4f"}}>Registro Profissional</th><th style={{...TH,background:"#2d6a4f",width:30}}></th></tr></thead>
                      <tbody>
                        {equipe.length===0&&<tr><td colSpan={4} style={{...TD,textAlign:"center",color:"#bbb",fontStyle:"italic"}}>Clique em "+ Membro" para adicionar</td></tr>}
                        {equipe.map((m,mi)=>(
                          <tr key={m.id} style={{background:mi%2?"#f8fdf9":"#fff"}}>
                            <td style={TD}><input value={m.nome||""} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,nome:e.target.value}:x))} style={{...SI,padding:"3px 6px",fontSize:11}}/></td>
                            <td style={TD}><input value={m.função||""} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,função:e.target.value}:x))} style={{...SI,padding:"3px 6px",fontSize:11}}/></td>
                            <td style={TD}><input value={m.registro||""} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,registro:e.target.value}:x))} style={{...SI,padding:"3px 6px",fontSize:11}}/></td>
                            <td style={TD}><button onClick={()=>setEquipe(eq=>eq.filter((_,i)=>i!==mi))} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"2px 7px",cursor:"pointer",fontSize:11}}>×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <div style={{textAlign:"center",padding:"16px 0 8px"}}>
              <button onClick={()=>setAba("relatorio")} style={{background:"linear-gradient(135deg,#2d6a4f,#1a3d2b)",color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:14,fontWeight:"bold",boxShadow:"0 4px 12px rgba(26,61,43,0.3)"}}>
                ✅ Salvar e Ir para o Relatório
              </button>
            </div>
          </div>
        )}
        {/* RELATORIO */}
        {aba==="relatorio"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{color:HC,margin:0}}>📄 Relatório Mensal</h2>
              <button onClick={()=>{var dr={lCons,lEmpr,empreendedor,construtora,empreendimento,equipe,nrel,mes,ano,intro,ativos,dados,fotos,nomes,cor,pCust};dlPDF(dr);}} style={{background:"#b5451b",color:"#fff",border:"none",borderRadius:8,padding:"9px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>📄 Baixar PDF</button>
            </div>
            <div id="reldoc" style={{background:"#fff",borderRadius:14,boxShadow:"0 3px 20px rgba(0,0,0,0.10)",overflow:"hidden",border:"1px solid #dde5db"}}>
              <Cab/>
              <div style={{padding:"28px 40px"}}>
                <div id="capa-rel" style={{textAlign:"center",padding:"60px 0 40px",marginBottom:0,pageBreakAfter:"always",minHeight:"60vh",display:"flex",flexDirection:"column",justifyContent:"center"}}>
                  <div style={{fontSize:12,color:"#555",marginBottom:12}}>{construtora.nome||emp||"[Empresa Executora]"} apresenta a {empreendedor.nome||"[Empreendedor]"} o documento:</div>
                  <div style={{fontSize:14,fontWeight:"bold",color:cor,lineHeight:1.7,marginBottom:12}}>RELATÓRIO MENSAL DE GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS{(empreendimento.nome||nEmp)&&<><br/>{(empreendimento.nome||nEmp).toUpperCase()}</>}<br/>PERÍODO DE {mes.toUpperCase()}/{ano}</div>
                  {equipe.length>0&&<div style={{fontSize:12,color:"#555"}}>{equipe.map(m=>m.nome).join(", ")}<br/><strong>{construtora.nome||emp}</strong></div>}
                </div>
                <div style={{marginBottom:20}}>
                  <h2 style={{color:cor,fontSize:13,marginBottom:10,textAlign:"left"}}>1. INTRODUÇÃO</h2>
                  <p style={{fontSize:12,color:"#444",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{intro}</p>
                </div>
                <div style={{marginBottom:20}}>
                  <h2 style={{color:cor,fontSize:13,marginBottom:12,textAlign:"left"}}>1. IDENTIFICAÇÃO DO EMPREENDIMENTO</h2>
                  {[
                    {titulo:"Quadro 1 – Identificação do Empreendedor", linhas:[["Empreendedor",empreendedor.nome],["CNPJ",empreendedor.cnpj],["Endereço",empreendedor.endereco],["Telefone",empreendedor.telefone],["Representante Legal",empreendedor.rep_legal],["E-mail",empreendedor.email]]},
                    {titulo:"Quadro 2 – Identificação da "+(construtora.label||"Empresa Construtora"), linhas:[["Empresa",construtora.nome],["CNPJ",construtora.cnpj],["Endereço",construtora.endereco],["Telefone",construtora.telefone],["E-mail",construtora.email]]},
                    {titulo:"Quadro 3 – Identificação do Empreendimento", linhas:[["Nome do Empreendimento",empreendimento.nome],["Estado (UF)",empreendimento.uf]]}
                  ].map((q,qi)=>{
                    var rows=q.linhas.filter(r=>r[1]);
                    if(!rows.length) return null;
                    return(
                      <div key={qi} style={{marginBottom:12}}>
                        <div style={{fontSize:11,fontWeight:"bold",color:"#333",marginBottom:4}}>{q.titulo}</div>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginBottom:4}}>
                          <thead><tr><th style={{...TH,background:cor,width:180}}>Campo</th><th style={{...TH,background:cor}}>Informação</th></tr></thead>
                          <tbody>{rows.map((r,i)=><tr key={i}><td style={{...TD,background:i%2?"#f8fdf9":"#fff",fontWeight:"bold",color:"#333"}}>{r[0]}</td><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{r[1]}</td></tr>)}</tbody>
                        </table>
                      </div>
                    );
                  })}
                  {equipe.length>0&&<div style={{marginBottom:12}}>
                    <div style={{fontSize:11,fontWeight:"bold",color:"#333",marginBottom:4}}>Quadro 4 – Identificação da Equipe Técnica</div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead><tr><th style={{...TH,background:cor}}>Nome</th><th style={{...TH,background:cor}}>Função</th><th style={{...TH,background:cor}}>Registro Profissional</th></tr></thead>
                      <tbody>{equipe.map((m,i)=><tr key={m.id}><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{m.nome||"—"}</td><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{m.funcao||"—"}</td><td style={{...TD,background:i%2?"#f8fdf9":"#fff"}}>{m.registro||"N/A"}</td></tr>)}
                      </tbody>
                    </table>
                  </div>}
                </div>
                <div style={{marginBottom:20}}>
                  <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:10,textAlign:"left"}}>2. PROGRAMAS EM EXECUÇÃO</h2>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr><th style={{...TH,background:cor,width:40}}>Nº</th><th style={{...TH,background:cor}}>Programa</th><th style={{...TH,background:cor,width:120}}>Status</th></tr></thead><tbody>{ativos.map((p,i)=><tr key={p.id}><td style={i%2?TA:TD}>{i+1}</td><td style={i%2?TA:TD}>{p.ic} {getL(p.id)}</td><td style={{...(i%2?TA:TD),color:"#2d6a4f",fontWeight:"bold"}}>● Em Execução</td></tr>)}</tbody></table>
                </div>
                <h2 style={{color:cor,fontSize:13,borderBottom:"2px solid "+cor,paddingBottom:5,marginBottom:18,textAlign:"left"}}>3. GESTÃO E SUPERVISÃO DOS PROGRAMAS AMBIENTAIS</h2>
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
                          {renderGráfico(gr, 200, true)}
                          {gr.texto&&<p style={{fontSize:11,color:"#444",lineHeight:1.7,marginTop:8,fontStyle:"italic",borderLeft:"3px solid "+p.cor,paddingLeft:10}}>{gr.texto}</p>}
                        </div>
                      ))}
                      {(d.tabelas||[]).filter(tb=>tb.addRel).length>0&&(
                        <div style={{marginBottom:16}}>
                          <h4 style={{fontSize:11,color:"#333",marginBottom:8}}>Tabelas</h4>
                          {(d.tabelas||[]).filter(tb=>tb.addRel).map((tb,ti)=>(
                            <div key={ti} style={{marginBottom:12}}>
                              <div style={{fontSize:11,fontWeight:"bold",color:cor,marginBottom:4}}>{tb.titulo||"Tabela "+(ti+1)}</div>
                              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                                <thead><tr>{(tb.headers||[]).map((h,hi)=><th key={hi} style={{background:cor,color:"#fff",padding:"5px 8px",border:"1px solid #ddd",textAlign:"left"}}>{h}</th>)}</tr></thead>
                                <tbody>{(tb.cells||[]).map((row,ri)=><tr key={ri} style={{background:ri%2?"#f8fdf9":"#fff"}}>{(row||[]).map((c,ci)=><td key={ci} style={{padding:"4px 8px",border:"1px solid #eee"}}>{c}</td>)}</tr>)}</tbody>
                              </table>
                              {tb.texto&&<p style={{fontSize:11,color:"#444",lineHeight:1.7,marginTop:6,fontStyle:"italic",borderLeft:"3px solid "+cor,paddingLeft:8}}>{tb.texto}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      {(d.quadros||[]).filter(tb=>tb.addRel).length>0&&(
                        <div style={{marginBottom:16}}>
                          <h4 style={{fontSize:11,color:"#333",marginBottom:8}}>Quadros</h4>
                          {(d.quadros||[]).filter(tb=>tb.addRel).map((tb,ti)=>(
                            <div key={ti} style={{marginBottom:12}}>
                              <div style={{fontSize:11,fontWeight:"bold",color:cor,marginBottom:4}}>{tb.titulo||"Quadro "+(ti+1)}</div>
                              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                                <thead><tr>{(tb.headers||[]).map((h,hi)=><th key={hi} style={{background:cor,color:"#fff",padding:"5px 8px",border:"1px solid #ddd",textAlign:"left"}}>{h}</th>)}</tr></thead>
                                <tbody>{(tb.cells||[]).map((row,ri)=><tr key={ri} style={{background:ri%2?"#f8fdf9":"#fff"}}>{(row||[]).map((c,ci)=><td key={ci} style={{padding:"4px 8px",border:"1px solid #eee"}}>{c}</td>)}</tr>)}</tbody>
                              </table>
                              {tb.texto&&<p style={{fontSize:11,color:"#444",lineHeight:1.7,marginTop:6,fontStyle:"italic",borderLeft:"3px solid "+cor,paddingLeft:8}}>{tb.texto}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}

                {(()=>{
                  var todosAnx=[];
                  var ng=1;
                  ativos.forEach(p=>{
                    var d2=getD(p.id);
                    (d2.anexos||[]).filter(a=>a.addRel).forEach(ax=>{
                      todosAnx.push({ax,prog:p,ng:ng++});
                    });
                  });
                  if(!todosAnx.length) return null;
                  return(
                    <div style={{marginBottom:20}}>
                      <h2 style={{color:cor,fontSize:13,marginBottom:12,textAlign:"left"}}>{ativos.some(p=>(getD(p.id).mapas||[]).some(m=>m.addRel))?"7":"6"}. ANEXOS</h2>
                      {todosAnx.map((item,i)=>(
                        <div key={i} style={{marginBottom:8,padding:"8px 12px",border:"1px solid #c8ddd2",borderRadius:7,background:"#fafdfb"}}>
                          <div style={{fontSize:11,fontWeight:"bold",color:cor,marginBottom:2}}>Anexo {item.ng}{item.ax.titulo?" – "+item.ax.titulo:""}</div>
                          <div style={{fontSize:10,color:"#888",marginBottom:3}}>Programa: {item.prog.lb}</div>
                          {item.ax.descricao&&<p style={{fontSize:11,color:"#444",margin:"3px 0"}}>{item.ax.descricao}</p>}
                          {item.ax.link&&<a href={item.ax.link} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#0066cc",display:"block",marginTop:3}}>🔗 {item.ax.link}</a>}
                          {item.ax.arquivo&&<a href={item.ax.arquivo.src} download={item.ax.arquivo.nome} style={{fontSize:10,color:"#2d6a4f",display:"block",marginTop:3,textDecoration:"none"}}>📄 {item.ax.arquivo.nome} <span style={{color:"#0066cc"}}>⬇ baixar</span></a>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div style={{marginTop:24,paddingTop:10,borderTop:"1px solid #ddd",display:"flex",justifyContent:"space-between",fontSize:9,color:"#aaa"}}><span>{emp}</span><span>{numR} Relatório – {mes}/{ano}</span></div>
              </div>
            </div>
          </div>
        )}
        {/* HISTORICO */}
        {aba==="historico"&&(
          <div>
            <h2 style={{color:HC,marginBottom:6}}>📁 Histórico e Download de Relatórios</h2>
            <div style={{background:"#fff8e1",border:"1px solid #f0c040",borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16}}>⚠️</span>
              <div>
                <div style={{fontSize:12,fontWeight:"bold",color:"#7d5a00",marginBottom:2}}>Relatórios ficam salvos por 40 dias</div>
                <div style={{fontSize:11,color:"#7d5a00"}}>Baixe o PDF antes do prazo. Após 40 dias os relatórios são excluídos automaticamente da nuvem.</div>
              </div>
            </div>
            <p style={{fontSize:12,color:"#888",marginBottom:16}}>Use o botão <strong>"💾 Salvar Relatório"</strong> no topo para guardar o relatório atual.</p>
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
{(()=>{
                        var dias=rel.dataISO?Math.max(0,40-Math.floor((new Date()-new Date(rel.dataISO))/(1000*60*60*24))):40;
                        var cor=dias<=7?"#b5451b":dias<=15?"#b08000":"#aaa";
                        return <div style={{fontSize:10,color:cor}}>💾 Salvo em {rel.data}{rel.dataISO?" · "+dias+" dias restantes":""}</div>;
                      })()}
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                      <button onClick={()=>carregarRelatorio(rel)} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>✏️ Abrir / Editar</button>
                      <button onClick={()=>{var dr={lCons:rel.estado?.lCons||lCons,lEmpr:rel.estado?.lEmpr||lEmpr,empreendedor:rel.estado?.empreendedor||empreendedor,construtora:rel.estado?.construtora||construtora,empreendimento:rel.estado?.empreendimento||empreendimento,equipe:rel.estado?.equipe||equipe,nrel:rel.estado?.nrel||nrel,mes:rel.mes,ano:rel.ano,intro:rel.estado?.intro||intro,ativos,dados:rel.estado?.dados||dados,fotos:rel.estado?.fotos||fotos,nomes,cor,pCust};dlPDF(dr);}} style={{background:"#b5451b",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:12,fontWeight:"bold"}}>📄 Baixar PDF</button>
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

