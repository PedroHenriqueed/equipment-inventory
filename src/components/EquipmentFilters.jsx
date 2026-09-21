import { X, Search, Check, ChevronDown, Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Dropdown from "./ui/Dropdown";
import {
  DISPOSITIVOS,
  MODELOS_POR_DISPOSITIVO,
  SISTEMAS_OPERACIONAIS,
  PROCESSADORES,
  MEMORIAS,
  POSSES,
} from "../constants/options";

const PERIFERICOS = [
  { key: "monitor", label: "Monitor" },
  { key: "hubUsb", label: "Hub USB" },
  { key: "webcam", label: "Webcam" },
  { key: "leitorBiometrico", label: "Leitor Biométrico" },
  { key: "fone", label: "Fone" },
];

const EMPTY_FILTERS = {
  busca: "",
  setor: "",
  responsavel: "",
  dispositivo: "",
  modelo: "",
  sistema_operacional: "",
  processador: "",
  memoria: "",
  posse: "",
  perifericos: [],
};

export default function EquipmentFilters({
  filters,
  setFilters,
  setores,
  responsaveis,
}) {
  const [funnelOpen, setFunnelOpen] = useState(false);
  const funnelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (funnelRef.current && !funnelRef.current.contains(e.target)) {
        setFunnelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePeriferico = (key) => {
    setFilters((prev) => {
      const atual = prev.perifericos || [];
      const novo = atual.includes(key)
        ? atual.filter((p) => p !== key)
        : [...atual, key];
      return { ...prev, perifericos: novo };
    });
  };

  const removeChip = (type, value) => {
    setFilters((prev) => {
      if (type === "periferico") {
        return {
          ...prev,
          perifericos: (prev.perifericos || []).filter((p) => p !== value),
        };
      }
      if (type === "dispositivo") {
        return { ...prev, dispositivo: "", modelo: "" };
      }
      return { ...prev, [type]: "" };
    });
  };

  const clearAll = () => setFilters(EMPTY_FILTERS);

  const activeChips = [];
  if (filters.setor)
    activeChips.push({ type: "setor", label: `Setor: ${filters.setor}` });
  if (filters.responsavel)
    activeChips.push({
      type: "responsavel",
      label: `Responsável: ${filters.responsavel}`,
    });
  if (filters.dispositivo)
    activeChips.push({
      type: "dispositivo",
      label: `Dispositivo: ${filters.dispositivo}`,
    });
  if (filters.modelo)
    activeChips.push({ type: "modelo", label: `Modelo: ${filters.modelo}` });
  if (filters.sistema_operacional)
    activeChips.push({
      type: "sistema_operacional",
      label: `SO: ${filters.sistema_operacional}`,
    });
  if (filters.processador)
    activeChips.push({
      type: "processador",
      label: `Processador: ${filters.processador}`,
    });
  if (filters.memoria)
    activeChips.push({ type: "memoria", label: `Memória: ${filters.memoria}` });
  if (filters.posse)
    activeChips.push({ type: "posse", label: `Posse: ${filters.posse}` });
  (filters.perifericos || []).forEach((key) => {
    const item = PERIFERICOS.find((p) => p.key === key);
    activeChips.push({ type: "periferico", value: key, label: item?.label });
  });

  const funnelActiveCount =
    (filters.dispositivo ? 1 : 0) +
    (filters.modelo ? 1 : 0) +
    (filters.sistema_operacional ? 1 : 0) +
    (filters.processador ? 1 : 0) +
    (filters.memoria ? 1 : 0) +
    (filters.posse ? 1 : 0) +
    (filters.perifericos?.length || 0);

  const modelosDisponiveis = MODELOS_POR_DISPOSITIVO[filters.dispositivo] || [];

  return (
    <div className="filters-container">
      {/* Linha de controles: EXATAMENTE como antes */}
      <div className="filters-controls">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.busca}
            onChange={(e) => setFilters({ ...filters, busca: e.target.value })}
            className="filter-input filter-input-icon"
          />
        </div>

        <div className="dropdown-filter">
          <Dropdown
            value={filters.setor}
            onChange={(e) => setFilters({ ...filters, setor: e.target.value })}
            placeholder="Todos os setores"
            options={[
              { value: "", label: "Todos os setores" },
              ...setores.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        <div className="dropdown-filter">
          <Dropdown
            value={filters.responsavel}
            onChange={(e) =>
              setFilters({ ...filters, responsavel: e.target.value })
            }
            placeholder="Todos os responsáveis"
            options={[
              { value: "", label: "Todos os responsáveis" },
              ...responsaveis.map((r) => ({ value: r, label: r })),
            ]}
          />
        </div>

        {/* BOTÃO FUNIL - agrupa os filtros avançados */}
        <div className="funnel-wrapper" ref={funnelRef}>
          <button
            className={`funnel-trigger ${funnelActiveCount ? "active" : ""}`}
            onClick={() => setFunnelOpen((v) => !v)}
            type="button"
          >
            <Filter size={16} />
            <span>Filtros</span>
            {funnelActiveCount > 0 && (
              <span className="funnel-count">{funnelActiveCount}</span>
            )}
          </button>

          {funnelOpen && (
            <div className="funnel-panel">
              <div className="funnel-panel-header">
                <h3>Filtros avançados</h3>
                <button
                  className="icon-btn"
                  onClick={() => setFunnelOpen(false)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="funnel-grid">
                <div className="dropdown-filter">
                  <Dropdown
                    value={filters.dispositivo}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dispositivo: e.target.value,
                        modelo: "",
                      })
                    }
                    placeholder="Todos os dispositivos"
                    options={[
                      { value: "", label: "Todos os dispositivos" },
                      ...DISPOSITIVOS.map((d) => ({ value: d, label: d })),
                    ]}
                  />
                </div>

                <div className="dropdown-filter">
                  <Dropdown
                    value={filters.modelo}
                    onChange={(e) =>
                      setFilters({ ...filters, modelo: e.target.value })
                    }
                    placeholder="Todos os modelos"
                    disabled={!filters.dispositivo}
                    options={[
                      { value: "", label: "Todos os modelos" },
                      ...modelosDisponiveis.map((m) => ({
                        value: m,
                        label: m,
                      })),
                    ]}
                  />
                </div>

                <div className="dropdown-filter">
                  <Dropdown
                    value={filters.sistema_operacional}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        sistema_operacional: e.target.value,
                      })
                    }
                    placeholder="Todos os SO"
                    options={[
                      { value: "", label: "Todos os SO" },
                      ...SISTEMAS_OPERACIONAIS.map((s) => ({
                        value: s,
                        label: s,
                      })),
                    ]}
                  />
                </div>

                <div className="dropdown-filter">
                  <Dropdown
                    value={filters.processador}
                    onChange={(e) =>
                      setFilters({ ...filters, processador: e.target.value })
                    }
                    placeholder="Todos os processadores"
                    options={[
                      { value: "", label: "Todos os processadores" },
                      ...PROCESSADORES.map((p) => ({ value: p, label: p })),
                    ]}
                  />
                </div>

                <div className="dropdown-filter">
                  <Dropdown
                    value={filters.memoria}
                    onChange={(e) =>
                      setFilters({ ...filters, memoria: e.target.value })
                    }
                    placeholder="Todas as memórias"
                    options={[
                      { value: "", label: "Todas as memórias" },
                      ...MEMORIAS.map((m) => ({ value: m, label: m })),
                    ]}
                  />
                </div>

                <div className="dropdown-filter">
                  <Dropdown
                    value={filters.posse}
                    onChange={(e) =>
                      setFilters({ ...filters, posse: e.target.value })
                    }
                    placeholder="Todas as posses"
                    options={[
                      { value: "", label: "Todas as posses" },
                      ...POSSES.map((p) => ({ value: p, label: p })),
                    ]}
                  />
                </div>
              </div>

              <div className="funnel-section">
                <label className="funnel-section-label">Periféricos</label>
                <div className="periferico-menu periferico-menu-static">
                  {PERIFERICOS.map((p) => (
                    <label key={p.key} className="periferico-item">
                      <span className="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={
                            filters.perifericos?.includes(p.key) || false
                          }
                          onChange={() => togglePeriferico(p.key)}
                        />
                        <span className="checkbox-box">
                          <Check size={12} className="checkbox-icon" />
                        </span>
                      </span>
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="funnel-panel-footer">
                <button
                  className="btn secondary"
                  onClick={clearAll}
                  type="button"
                >
                  Limpar tudo
                </button>
                <button
                  className="btn primary"
                  onClick={() => setFunnelOpen(false)}
                  type="button"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chips de filtros ativos: EXATAMENTE como antes */}
      {activeChips.length > 0 && (
        <div className="filters-chips">
          {activeChips.map((chip, i) => (
            <span key={i} className="filter-chip">
              {chip.label}
              <button
                onClick={() => removeChip(chip.type, chip.value)}
                className="chip-remove"
                aria-label="Remover filtro"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button onClick={clearAll} className="clear-all-btn">
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}
