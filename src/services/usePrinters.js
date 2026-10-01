import { useState, useEffect, useCallback } from "react";
import { fetchPrinters, createPrinter } from "../hooks/printersService";

export function usePrinters() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrinters();
      setPrinters(data);
    } catch (err) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addPrinter = async (data) => {
    const novo = await createPrinter(data);
    setPrinters((prev) => [...prev, novo]);
    return novo;
  };

  return { printers, loading, error, refetch: load, addPrinter };
}
