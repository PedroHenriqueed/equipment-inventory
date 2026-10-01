import { supabase } from "../lib/supabaseClient"; // ajuste o caminho conforme seu projeto

export async function fetchPrinters() {
  const { data, error } = await supabase
    .from("printers")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw new Error(error.message);

  // Normaliza nomes de campo para o padrão usado no frontend (camelCase)
  return data.map((p) => ({
    id: p.id,
    nome: p.nome,
    ip: p.ip,
    marca: p.marca,
    modelo: p.modelo,
    setor: p.setor,
    status: p.status,
    nivelToner: p.nivel_toner,
  }));
}

export async function createPrinter({ nome, ip, marca, modelo, setor }) {
  const { data, error } = await supabase
    .from("printers")
    .insert([{ nome, ip, marca, modelo, setor }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    nome: data.nome,
    ip: data.ip,
    marca: data.marca,
    modelo: data.modelo,
    setor: data.setor,
    status: data.status,
    nivelToner: data.nivel_toner,
  };
}
