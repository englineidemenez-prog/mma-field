export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).end();
  const token=req.query.token;
  const expectedToken=process.env.KIWIFY_WEBHOOK_TOKEN;
  if(expectedToken&&token!==expectedToken)return res.status(401).json({error:"Unauthorized"});
  const{createClient}=await import("@supabase/supabase-js");
  const supabase=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY);
  const body=req.body;
  const event=body?.webhook_event_type;
  const email=body?.Customer?.email?.toLowerCase().trim();
  if(!email)return res.status(400).json({error:"Email nao encontrado"});
  const MAP={compra_aprovada:"ativa",subscription_renewed:"ativa",subscription_late:"atrasada",subscription_canceled:"cancelada",compra_reembolsada:"cancelada",chargeback:"cancelada"};
  const novoStatus=MAP[event];
  if(!novoStatus)return res.status(200).json({ok:true,ignorado:event});
  const{error}=await supabase.from("assinaturas").upsert({email,status:novoStatus,atualizado_em:new Date().toISOString()},{onConflict:"email"});
  if(error)return res.status(500).json({error:error.message});
  return res.status(200).json({ok:true});
}
