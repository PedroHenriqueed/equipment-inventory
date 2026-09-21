import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const CONSTRAINT_MAP = {
  idx_unique_mac: { field: "mac", label: "MAC" },
  idx_unique_numero_serie: { field: "numero_serie", label: "Número de Série" },
  idx_unique_patrimonio_dispositivo: {
    field: "patrimonio_dispositivo",
    label: "Patrimônio do Dispositivo",
  },
  idx_unique_patrimonio_carregador: {
    field: "patrimonio_carregador",
    label: "Patrimônio do Carregador",
  },
  idx_unique_patrimonio_leitor_biometrico: {
    field: "patrimonio_leitor_biometrico",
    label: "Patrimônio do Leitor Biométrico",
  },
  idx_unique_patrimonio_monitor: {
    field: "patrimonio_monitor",
    label: "Patrimônio do Monitor",
  },
};

function mapConstraintToField(message) {
  if (message.includes("patrimonio_duplicado")) {
    return { field: "patrimonio", label: "Patrimônio" };
  }
  for (const key in CONSTRAINT_MAP) {
    if (message.includes(key)) return CONSTRAINT_MAP[key];
  }
  return { field: null, label: "Campo" };
}

export function useEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEquipments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("equipamentos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setEquipments(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  const addEquipment = async (formData) => {
    const { data, error } = await supabase
      .from("equipamentos")
      .insert([formData])
      .select();

    if (error) {
      if (error.code === "23505") {
        const field = mapConstraintToField(error.message);
        throw { type: "duplicate", field, message: error.message };
      }
      throw error;
    }

    setEquipments((prev) => [...prev, ...data]);
    return data[0];
  };

  const updateEquipment = async (id, payload) => {
    const { data, error } = await supabase
      .from("equipamentos")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        const field = mapConstraintToField(error.message);
        throw { type: "duplicate", field, message: error.message };
      }
      throw error;
    }

    setEquipments((prev) => prev.map((eq) => (eq.id === id ? data : eq)));
    return data;
  };

  const deleteEquipment = async (id) => {
    const { error } = await supabase.from("equipamentos").delete().eq("id", id);
    if (error) throw error;
    setEquipments((prev) => prev.filter((eq) => eq.id !== id));
  };

  return {
    equipments,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    refetch: fetchEquipments,
  };
}
