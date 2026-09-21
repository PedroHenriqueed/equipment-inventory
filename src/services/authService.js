import { supabase } from "../lib/supabaseClient";

export const authService = {
  async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUsuarioAtual() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  },

  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};
