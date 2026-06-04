export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const body = req.body;
  const email = body?.Customer?.email;
  const status = body?.order_status || body?.subscription?.status;

  if (!email) return res.status(400).json({ error: "Email não encontrado" });

  if (status === "paid" || status === "active") {
    const { error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-10),
    });
    if (error && !error.message.includes("already")) {
      return res.status(500).json({ error: error.message });
    }
    await supabase.auth.admin.inviteUserByEmail(email);
  }

  if (status === "canceled" || status === "chargedback") {
    const { data } = await supabase.auth.admin.listUsers();
    const user = data?.users?.find(u => u.email === email);
    if (user) {
      await supabase.auth.admin.updateUserById(user.id, { ban_duration: "876600h" });
    }
  }

  return res.status(200).json({ ok: true });
}