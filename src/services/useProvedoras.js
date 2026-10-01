import { useState, useEffect, useCallback } from "react";
import { fetchProvedoras, createProvedora } from "../hooks/provedorasService";

export function useProvedoras() {
  const [provedoras, setProvedoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProvedoras();
      setProvedoras(data);
    } catch (err) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProvedora = async (data) => {
    const nova = await createProvedora(data);
    setProvedoras((prev) => [...prev, nova]);
    return nova;
  };

  return { provedoras, loading, error, refetch: load, addProvedora };
}
