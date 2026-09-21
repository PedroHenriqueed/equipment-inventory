import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [role, setRole] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarPerfil(user) {
    if (!user) {
      setRole(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    setRole(data?.role ?? "viewer");
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user ?? null;
      setUsuario(user);
      await carregarPerfil(user);
      setCarregando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setUsuario(user);
        await carregarPerfil(user);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw error;
  }

  async function loginComGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setRole(null);
  }

  const rolesComAcessoAdmin = ["admin", "superadmin"];
  const isAdmin = rolesComAcessoAdmin.includes(role);
  const isSuperAdmin = role === "superadmin";

  return (
    <AuthContext.Provider
      value={{
        usuario,
        role,
        isAdmin,
        isSuperAdmin,
        login,
        loginComGoogle,
        logout,
        carregando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
