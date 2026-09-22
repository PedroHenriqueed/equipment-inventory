import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import ActionMenu from "./ActionMenu";
import { Status } from "../components/ui/Status";

const COLUMNS = [
  { key: "status", label: "Status" },
  { key: "responsavel", label: "Responsável" },
  { key: "setor", label: "Setor" },
  { key: "dispositivo", label: "Dispositivo" },
  { key: "modelo", label: "Modelo" },
  { key: "numero_serie", label: "Nº Série" },
  { key: "patrimonio_dispositivo", label: "Patrimônio" },
];

export default function EquipmentList({
  equipments,
  onEdit,
  onDelete,
  onBulkDelete,
  responsavelFiltro,
  historicoIds,
}) {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  function mapStatusClass(status) {
    const normalized = (status || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/\s+/g, "-");
    return `status-${normalized}`;
  }

  // Navega para a página de detalhes do equipamento
  const handleView = (eq) => {
    navigate(`/equipamentos/${eq.id}`);
  };

  // ===== Ordenação =====
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      if (prev.direction === "desc") return { key: null, direction: null };
      return { key, direction: "asc" };
    });
  };

  const sortedEquipments = useMemo(() => {
    if (!sortConfig.key) return equipments;
    const { key, direction } = sortConfig;
    return [...equipments].sort((a, b) => {
      const valA = (a[key] ?? "").toString().toLowerCase();
      const valB = (b[key] ?? "").toString().toLowerCase();
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [equipments, sortConfig]);

  // ===== Seleção =====
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const allSelected =
    sortedEquipments.length > 0 &&
    selectedIds.length === sortedEquipments.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedEquipments.map((eq) => eq.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = () => {
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  if (equipments.length === 0) {
    return <p className="empty-state">Nenhum equipamento cadastrado.</p>;
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="selection-bar">
          <div className="selection-bar-left">
            <span className="selection-count">
              {selectedIds.length} selecionado
              {selectedIds.length > 1 ? "s" : ""}
            </span>
            <button className="link-btn" onClick={clearSelection}>
              Limpar seleção
            </button>
            {!allSelected && (
              <button className="link-btn" onClick={toggleSelectAll}>
                Selecionar todos
              </button>
            )}
          </div>
          <button className="btn danger" onClick={handleBulkDelete}>
            Excluir {selectedIds.length} equipamento
            {selectedIds.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="equipment-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                  <span className="checkbox-box">
                    <span className="checkbox-icon">✓</span>
                  </span>
                </label>
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="th-sortable"
                >
                  <div className="th-sortable-content">
                    <span>{col.label}</span>
                    <span className="sort-icons">
                      <ChevronUp
                        size={12}
                        className={
                          sortConfig.key === col.key &&
                          sortConfig.direction === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <ChevronDown
                        size={12}
                        className={
                          sortConfig.key === col.key &&
                          sortConfig.direction === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </span>
                  </div>
                </th>
              ))}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedEquipments.map((eq) => {
              const ehHistorico =
                responsavelFiltro &&
                eq.responsavel !== responsavelFiltro &&
                historicoIds?.has(eq.id);

              return (
                <tr
                  key={eq.id}
                  onClick={() => handleView(eq)}
                  className="equipment-row"
                  style={{ cursor: "pointer" }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(eq.id)}
                        onChange={() => toggleSelect(eq.id)}
                      />
                      <span className="checkbox-box">
                        <span className="checkbox-icon">✓</span>
                      </span>
                    </label>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${mapStatusClass(eq.status)}`}
                    >
                      <span className="status-dot" />
                      {eq.status || "-"}
                    </span>
                  </td>
                  <td>
                    {eq.responsavel}
                    {ehHistorico && (
                      <span
                        className="badge-historico"
                        title={`${responsavelFiltro} já utilizou este equipamento anteriormente`}
                      >
                        já usado por {responsavelFiltro}
                      </span>
                    )}
                  </td>
                  <td>{eq.setor || "-"}</td>
                  <td>{eq.dispositivo}</td>
                  <td>{eq.modelo || "-"}</td>
                  <td>{eq.numero_serie || "-"}</td>
                  <td>{eq.patrimonio_dispositivo || "-"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                      onView={() => handleView(eq)}
                      onEdit={() => onEdit(eq)}
                      onDelete={() => onDelete(eq)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
