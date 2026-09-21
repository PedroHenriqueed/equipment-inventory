import { supabase } from "../lib/supabaseClient";

export const equipamentosService = {
  async getUltimosAdicionados() {
    const { data, error } = await supabase
      .from("equipamentos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw error;
    return data;
  },

  async getEmManutencao() {
    const { data, error } = await supabase.rpc("equipamentos_em_manutencao");
    if (error) throw error;
    return data;
  },

  async getDisponiveis() {
    const { data, error } = await supabase.rpc("equipamentos_disponiveis");
    if (error) throw error;
    return data;
  },

  async getRankingPorSetor() {
    const { data, error } = await supabase.rpc("ranking_setores");
    if (error) throw error;
    return data;
  },

  async getRankingQuebrasPorSetor() {
    const { data, error } = await supabase.rpc("ranking_quebras_setor");
    if (error) throw error;
    return data;
  },

  async getSetores() {
    const { data, error } = await supabase
      .from("setores")
      .select("*")
      .order("nome");
    if (error) throw error;
    return data;
  },

  async criar(equipamento) {
    const { data, error } = await supabase
      .from("equipamentos")
      .insert([equipamento])
      .select();
    if (error) throw error;
    return data[0];
  },

  async editar(id, equipamento) {
    const { data, error } = await supabase
      .from("equipamentos")
      .update({ ...equipamento, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async excluir(id) {
    const { error } = await supabase.from("equipamentos").delete().eq("id", id);
    if (error) throw error;
  },
};
