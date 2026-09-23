import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Busca o registro mais recente de inventário para um hostname específico
export function useInventario(hostname) {
  const [inventario, setInventario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hostname) {
      setInventario(null);
      return;
    }

    let ativo = true;
    setLoading(true);
    setError(null);

    async function fetchInventario() {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
        .eq("sistema->>hostname", hostname) 
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!ativo) return;

      if (error) setError(error.message);
      else setInventario(data);

      setLoading(false);
    }

    fetchInventario();

    return () => {
      ativo = false;
    };
  }, [hostname]);

  return { inventario, loading, error };
}
