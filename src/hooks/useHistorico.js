import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // ajuste o path se necessário

export function useHistorico(numeroSerie) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!numeroSerie) {
      setLoading(false);
      return;
    }

    async function fetchHistorico() {
      setLoading(true);
      const { data, error } = await supabase
        .from("historico_responsaveis")
        .select("*")
        .eq("numero_serie", numeroSerie)
        .order("data_transferencia", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setHistorico(data || []);
      }
      setLoading(false);
    }

    fetchHistorico();
  }, [numeroSerie]);

  return { historico, loading, error };
}
