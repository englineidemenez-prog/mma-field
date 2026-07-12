$file = "src\App.jsx"
$code = Get-Content $file -Raw -Encoding UTF8

# 1. Adicionar novos estados após o bloco de campos
$old1 = '  ]);
  const [nrel, setNrel]'
$new1 = '  ]);
  const [empreendedor, setEmpreendedor] = useState(ei?.empreendedor || {nome:"",cnpj:"",endereco:"",telefone:"",rep_legal:"",email:""});
  const [construtora, setConstrutora]   = useState(ei?.construtora || {label:"Empresa Construtora",nome:"",cnpj:"",endereco:"",telefone:"",email:""});
  const [empreendimento, setEmpreendimento] = useState(ei?.empreendimento || {nome:"",uf:""});
  const [equipe, setEquipe]             = useState(ei?.equipe || []);
  const [nrel, setNrel]'
$code = $code.Replace($old1, $new1)

# 2. Atualizar save
$code = $code.Replace(
  'var estado = {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro};',
  'var estado = {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,empreendedor,construtora,empreendimento,equipe};'
)

# 3. Atualizar dependency array
$code = $code.Replace(
  '], [fotos,dados,inv,cor,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro]);',
  '], [fotos,dados,inv,cor,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,empreendedor,construtora,empreendimento,equipe]);'
)

# 4. Atualizar estado do relatorio salvo
$code = $code.Replace(
  'estado: {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro}',
  'estado: {fotos,dados,inv,cor,lCons,lEmpr,campos,nrel,mes,ano,pAtiv,pCust,nomes,extras,intro,empreendedor,construtora,empreendimento,equipe}'
)

# 5. Atualizar carregar relatorio
$code = $code.Replace(
  'setIntro(e.intro||INTRO_DEFAULT);',
  'setIntro(e.intro||INTRO_DEFAULT);
    setEmpreendedor(e.empreendedor||{nome:"",cnpj:"",endereco:"",telefone:"",rep_legal:"",email:""});
    setConstrutora(e.construtora||{label:"Empresa Construtora",nome:"",cnpj:"",endereco:"",telefone:"",email:""});
    setEmpreendimento(e.empreendimento||{nome:"",uf:""});
    setEquipe(e.equipe||[]);'
)

# 6. Substituir secao de identificacao
$old6 = '                  <div style={{borderTop:"1px solid #e2ebe5",paddingTop:12,marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <h4 style={{color:"#2d6a4f",fontSize:12,margin:0}}>🪪 Identificação</h4>
                      <button onClick={()=>setCampos(c=>[...c,{id:"fc"+Date.now(),lb:"Novo Campo",val:"",ed:true}])} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 11px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:10,fontWeight:"bold"}}>+ Campo</button>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {campos.map(f=>(<div key={f.id} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 8px",background:"#fafdfb",borderRadius:7,border:"1px solid #e2ebe5"}}><div style={{width:160,cursor:"pointer",flexShrink:0}} onClick={()=>updC(f.id,{ed:!f.ed})}>{f.ed?<input autoFocus value={f.lb} onChange={e=>updC(f.id,{lb:e.target.value})} onBlur={()=>updC(f.id,{ed:false})} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")updC(f.id,{ed:false});}} style={{...SI,fontSize:10,padding:"2px 5px",border:"1px solid #2d6a4f"}}/>:<div style={{fontSize:10,fontWeight:"bold",color:"#2d6a4f"}}>{f.lb} <span style={{opacity:0.4,fontSize:9}}>✏️</span></div>}</div><input value={f.val} onChange={e=>updC(f.id,{val:e.target.value})} style={{...SI,flex:1,fontSize:11,padding:"4px 7px"}}/><button onClick={()=>setCampos(c=>c.filter(x=>x.id!==f.id))} style={{background:"none",border:"1px solid #e0bcbc",color:"#b5451b",borderRadius:5,padding:"3px 6px",cursor:"pointer",fontSize:11}}>×</button></div>))}
                    </div>
                  </div>'

$new6 = '                  <div style={{borderTop:"1px solid #e2ebe5",paddingTop:12,marginBottom:12}}>
                    <h4 style={{color:"#2d6a4f",fontSize:12,marginBottom:10}}>🏢 Identificação do Empreendedor</h4>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                      {[["nome","Nome / Razão Social"],["cnpj","CNPJ"],["endereco","Endereço"],["telefone","Telefone"],["rep_legal","Representante Legal"],["email","E-mail"]].map(([k,lb])=>(
                        <div key={k}><label style={LB}>{lb}</label><input value={empreendedor[k]||""} onChange={e=>setEmpreendedor(x=>({...x,[k]:e.target.value}))} style={SI}/></div>
                      ))}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <h4 style={{color:"#2d6a4f",fontSize:12,margin:0}}>🏗️</h4>
                      <input value={construtora.label||"Empresa Construtora"} onChange={e=>setConstrutora(x=>({...x,label:e.target.value}))} placeholder="Empresa Construtora / Consultoria..." style={{...SI,fontWeight:"bold",fontSize:12,width:280}} title="Clique para editar o nome deste quadro"/>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                      {[["nome","Nome / Razão Social"],["cnpj","CNPJ"],["endereco","Endereço"],["telefone","Telefone"],["email","E-mail"]].map(([k,lb])=>(
                        <div key={k}><label style={LB}>{lb}</label><input value={construtora[k]||""} onChange={e=>setConstrutora(x=>({...x,[k]:e.target.value}))} style={SI}/></div>
                      ))}
                    </div>
                    <h4 style={{color:"#2d6a4f",fontSize:12,marginBottom:6}}>📍 Identificação do Empreendimento</h4>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
                      <div><label style={LB}>Nome do Empreendimento</label><input value={empreendimento.nome||""} onChange={e=>setEmpreendimento(x=>({...x,nome:e.target.value}))} style={SI}/></div>
                      <div><label style={LB}>Estado (UF)</label><input value={empreendimento.uf||""} onChange={e=>setEmpreendimento(x=>({...x,uf:e.target.value}))} style={SI}/></div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <h4 style={{color:"#2d6a4f",fontSize:12,margin:0}}>👷 Equipe Técnica</h4>
                      <button onClick={()=>setEquipe(eq=>[...eq,{id:Date.now(),nome:"",funcao:"",registro:""}])} style={{background:"#2d6a4f",color:"#fff",border:"none",borderRadius:6,padding:"4px 11px",cursor:"pointer",fontFamily:"Georgia,serif",fontSize:10,fontWeight:"bold"}}>+ Membro</button>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginBottom:4}}>
                      <thead><tr><th style={{...TH,background:"#2d6a4f"}}>Nome</th><th style={{...TH,background:"#2d6a4f"}}>Função</th><th style={{...TH,background:"#2d6a4f"}}>Registro Profissional</th><th style={{...TH,background:"#2d6a4f",width:30}}></th></tr></thead>
                      <tbody>
                        {equipe.length===0&&<tr><td colSpan={4} style={{...TD,textAlign:"center",color:"#bbb",fontStyle:"italic"}}>Clique em "+ Membro" para adicionar</td></tr>}
                        {equipe.map((m,mi)=>(
                          <tr key={m.id} style={{background:mi%2?"#f8fdf9":"#fff"}}>
                            <td style={TD}><input value={m.nome||""} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,nome:e.target.value}:x))} style={{...SI,padding:"3px 6px",fontSize:11}}/></td>
                            <td style={TD}><input value={m.funcao||""} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,funcao:e.target.value}:x))} style={{...SI,padding:"3px 6px",fontSize:11}}/></td>
                            <td style={TD}><input value={m.registro||""} onChange={e=>setEquipe(eq=>eq.map((x,i)=>i===mi?{...x,registro:e.target.value}:x))} style={{...SI,padding:"3px 6px",fontSize:11}}/></td>
                            <td style={TD}><button onClick={()=>setEquipe(eq=>eq.filter((_,i)=>i!==mi))} style={{background:"none",border:"1px solid #b5451b",color:"#b5451b",borderRadius:5,padding:"2px 7px",cursor:"pointer",fontSize:11}}>x</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>'

$code = $code.Replace($old6, $new6)

[System.IO.File]::WriteAllText((Resolve-Path $file), $code, [System.Text.Encoding]::UTF8)
Write-Host "OK - fix aplicado com sucesso!"
