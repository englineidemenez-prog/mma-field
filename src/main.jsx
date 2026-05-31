import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Auth from "./Auth.jsx";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export { supabase };

function Root() {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"Georgia,serif",color:"#1a3d2b"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🌿</div>
        <div style={{fontSize:18,fontWeight:"bold"}}>MMA Field</div>
        <div style={{fontSize:13,color:"#888",marginTop:8}}>Carregando...</div>
      </div>
    </div>
  );

  return session ? <App supabase={supabase} session={session}/> : <Auth supabase={supabase}/>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root/>);
