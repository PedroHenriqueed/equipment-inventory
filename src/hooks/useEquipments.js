import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const CONSTRAINT_MAP = {
  idx_unique_mac: { field: "mac", label: "MAC" },
  idx_unique_numero_serie: { field: "numero_serie", label: "Número de Série" },
  idx_unique_hostname: { field: "hostname", label: "Hostname" },
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

// Registra uma transição de status na tabela de histórico.
// Não lança erro para não travar o update principal caso essa gravação falhe.
async function registrarHistoricoStatus(
  equipmentId,
  statusAnterior,
  statusNovo,
) {
  const { error } = await supabase.from("status_history").insert({
    equipment_id: equipmentId,
    status_anterior: statusAnterior,
    status_novo: statusNovo,
  });

  if (error) {
    console.error("Erro ao registrar histórico de status:", error.message);
  }
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

    // registra o status inicial no histórico (opcional, mas útil pra ter o registro completo)
    if (data[0]?.status) {
      await registrarHistoricoStatus(data[0].id, null, data[0].status);
    }

    setEquipments((prev) => [...prev, ...data]);
    return data[0];
  };

  const updateEquipment = async (id, payload) => {
    // busca o status atual (antes do update) para comparar
    const equipamentoAtual = equipments.find((eq) => eq.id === id);
    const statusAnterior = equipamentoAtual?.status;

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

    // se o status mudou, registra no histórico
    if (payload.status && statusAnterior && payload.status !== statusAnterior) {
      await registrarHistoricoStatus(id, statusAnterior, payload.status);
    }

    setEquipments((prev) => prev.map((eq) => (eq.id === id ? data : eq)));
    return data;
  };

  const deleteEquipment = async (id) => {
    const { error } = await supabase.from("equipamentos").delete().eq("id", id);
    if (error) throw error;
    setEquipments((prev) => prev.filter((eq) => eq.id !== id));
  };

  // busca o histórico de status de um equipamento específico
  const fetchStatusHistory = async (equipmentId) => {
    const { data, error } = await supabase
      .from("status_history")
      .select("*")
      .eq("equipment_id", equipmentId)
      .order("criado_em", { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    equipments,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    fetchStatusHistory,
    refetch: fetchEquipments,
  };
}
