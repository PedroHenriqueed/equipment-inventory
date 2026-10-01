import { supabase } from "../lib/supabaseClient";

export async function fetchProvedoras() {
  const { data, error } = await supabase
    .from("provedoras")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((p) => ({
    id: p.id,
    nome: p.nome,
    ipTeste: p.ip_teste,
    status: p.status,
    latenciaMs: p.latencia_ms,
    perdaPacotes: p.perda_pacotes,
    atualizadoEm: p.atualizado_em,
  }));
}

export async function createProvedora({ nome, ipTeste }) {
  const { data, error } = await supabase
    .from("provedoras")
    .insert([{ nome, ip_teste: ipTeste }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    nome: data.nome,
    ipTeste: data.ip_teste,
    status: data.status,
    latenciaMs: data.latencia_ms,
    perdaPacotes: data.perda_pacotes,
    atualizadoEm: data.atualizado_em,
  };
}
