import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // ajuste o path se necessário
import EquipmentFilters from "./EquipmentFilters"; // ajuste o path se necessário
import EquipmentList from "./EquipmentList"; // ajuste o path se necessário

const FILTROS_EXATOS = [
  "setor",
  "responsavel",
  "dispositivo",
  "modelo",
  "sistema_operacional",
  "processador",
  "memoria",
];

const PERIFERICO_MAP = {
  monitor: "monitor",
  hub_usb: "hubUsb",
  webcam: "webcam",
  leitor_biometrico: "leitorBiometrico",
  fone: "fone",
};

function getPerifericosAtivos(eq) {
  return Object.entries(PERIFERICO_MAP)
    .filter(([campoBackend]) => eq[campoBackend])
    .map(([, chaveFiltro]) => chaveFiltro);
}

export default function VisualizarEquipamentos({
  equipments,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onBulkDelete,
  filters,
  setFilters,
  isAdmin,
}) {
  // ===== Derivar listas de opções a partir dos equipamentos =====
  const setores = useMemo(() => {
    if (!equipments) return [];
    return [...new Set(equipments.map((e) => e.setor).filter(Boolean))];
  }, [equipments]);

  const responsaveis = useMemo(() => {
    if (!equipments) return [];
    return [...new Set(equipments.map((e) => e.responsavel).filter(Boolean))];
  }, [equipments]);

  // ===== Buscar histórico de transferências quando filtrar por responsável =====
  const [historicoIds, setHistoricoIds] = useState(new Set());

useEffect(() => {
  async function buscarHistorico() {
    if (!filters.responsavel) {
      setHistoricoIds(new Set());
      return;
    }

    const valor = filters.responsavel.replace(/"/g, '\\"');

    const { data, error } = await supabase
      .from("equipamentos_transferencias")
      .select("equipamento_id, responsavel_anterior, responsavel_novo")
      .or(`responsavel_anterior.eq."${valor}",responsavel_novo.eq."${valor}"`);

    if (error) {
      console.error("Erro ao buscar histórico de transferências:", error);
      setHistoricoIds(new Set());
      return;
    }

    setHistoricoIds(new Set((data || []).map((d) => d.equipamento_id)));
  }

  buscarHistorico();
}, [filters.responsavel]);

  // ===== Filtragem =====
  const equipmentsFiltrados = useMemo(() => {
    if (!equipments) return [];

    let resultado = equipments.filter((eq) => {
      // Busca livre (procura em vários campos)
      if (filters.busca) {
        const termo = filters.busca.toLowerCase();
        const camposBusca = [
          eq.responsavel,
          eq.setor,
          eq.dispositivo,
          eq.modelo,
          eq.numero_serie,
          eq.patrimonio_dispositivo,
        ];
        const encontrou = camposBusca.some((campo) =>
          (campo || "").toLowerCase().includes(termo),
        );
        if (!encontrou) return false;
      }

      // Filtros de valor exato (dropdowns fixos), exceto "responsavel"
      // que tem tratamento especial abaixo (para incluir histórico)
      for (const key of FILTROS_EXATOS) {
        if (key === "responsavel") continue;
        if (filters[key]) {
          if ((eq[key] || "") !== filters[key]) return false;
        }
      }

      // Filtro de responsável: inclui responsável atual OU histórico
      if (filters.responsavel) {
        const combinaAtual = eq.responsavel === filters.responsavel;
        const combinaHistorico = historicoIds.has(eq.id);
        if (!combinaAtual && !combinaHistorico) return false;
      }

      // Filtro de posse
      if (filters.posse) {
        if ((eq.posse || "") !== filters.posse) return false;
      }

      // Filtro de periféricos (múltipla seleção)
      if (filters.perifericos && filters.perifericos.length > 0) {
        const perifEq = getPerifericosAtivos(eq);
        const temTodos = filters.perifericos.every((p) => perifEq.includes(p));
        if (!temTodos) return false;
      }

      return true;
    });

    // Ordenação: quando filtrar por responsável, o equipamento ATUAL
    // desse responsável vem primeiro; os do histórico vêm depois.
    if (filters.responsavel) {
      resultado = [...resultado].sort((a, b) => {
        const aAtual = a.responsavel === filters.responsavel ? 0 : 1;
        const bAtual = b.responsavel === filters.responsavel ? 0 : 1;
        return aAtual - bAtual;
      });
    }

    return resultado;
  }, [equipments, filters, historicoIds]);

  if (loading) return <p className="empty-state">Carregando equipamentos...</p>;
  if (error)
    return <p className="empty-state">Erro ao carregar equipamentos.</p>;

  return (
    <div>
      <EquipmentFilters
        filters={filters}
        setFilters={setFilters}
        setores={setores}
        responsaveis={responsaveis}
      />

      <EquipmentList
        equipments={equipmentsFiltrados}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onBulkDelete={onBulkDelete}
        isAdmin={isAdmin}
        responsavelFiltro={filters.responsavel}
        historicoIds={historicoIds}
      />
    </div>
  );
}
