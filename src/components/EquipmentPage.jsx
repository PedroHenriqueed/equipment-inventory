import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Laptop,
  Building2,
  SquarePen,
  Check,
  X,
  Bolt,
  MonitorCog,
  TicketsPlane,
  LayoutDashboard,
  BrickWallShield,
  Shield,
  TriangleAlert,
  CircleCheckBig,
  FileText,
  MonitorSpeaker,
  Cable,
  Monitor,
  Fingerprint,
  UploadCloud,
  Download,
  FileArchive,
  FileSpreadsheet,
  Music,
  Video,
  FileImage,
  Headphones,
  Usb,
  Webcam,
  RotateCcwClock,
} from "lucide-react";
import { useInventario } from "../hooks/useInventario"; // ajuste o path se necessário
import { useHistorico } from "../hooks/useHistorico"; // ajuste o path se necessário
import { supabase } from "../lib/supabaseClient"; // ajuste o path se necessário
import { SETORES, DISPOSITIVOS, POSSES } from "../constants/options"; // ✅ import corrigido
import ToogleSwitch from "./ToogleSwitch";
import WindowsLicenseCard from "./WindowsLicenseCard";
import Dropdown from "./ui/Dropdown";

// Ícone customizado do Windows (lucide-react não possui ícones de marca)
function WindowsIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 3.5L10.5 2.5V11H3V3.5Z" />
      <path d="M11.5 2.4L21 1V11H11.5V2.4Z" />
      <path d="M3 12H10.5V20.5L3 19.5V12Z" />
      <path d="M11.5 12H21V22L11.5 20.7V12Z" />
    </svg>
  );
}

function resumirProcessador(processadorCompleto) {
  if (!processadorCompleto) return "-";
  const match = processadorCompleto.match(/i[3579]-\d{4,5}[A-Z]*/i);
  return match ? match[0] : processadorCompleto;
}

// Cada aba agora tem seu ícone
const TABS = [
  { label: "Geral", icon: Bolt },
  { label: "Hardware", icon: MonitorCog },
  { label: "Patrimônios", icon: TicketsPlane },
  { label: "Documentos", icon: FileText },
  { label: "Histórico", icon: RotateCcwClock },
];

// ===== Configuração das opções de Status =====
const STATUS_OPTIONS = [
  { label: "Em uso", color: "bg-blue-500" },
  { label: "Disponível", color: "bg-emerald-500" },
  { label: "Em manutenção", color: "bg-red-500" },
  { label: "Empréstimo", color: "bg-amber-500" },
];

function getStatusColor(status) {
  const found = STATUS_OPTIONS.find(
    (opt) => opt.label.toLowerCase() === status?.toLowerCase()?.trim(),
  );
  return found?.color ?? "bg-gray-400";
}

export default function EquipmentPage({ equipamento, isAdmin, onEquipamentoAtualizado }) {
  const [activeTab, setActiveTab] = useState("Geral");
  const [statusAtual, setStatusAtual] = useState(equipamento?.status);
  const [responsavelAtual, setResponsavelAtual] = useState(
    equipamento?.responsavel,
  );
  const [setorAtual, setSetorAtual] = useState(equipamento?.setor);
  const [showEditModal, setShowEditModal] = useState(false);
  const [equipamentoLocal, setEquipamentoLocal] = useState(equipamento);
  const navigate = useNavigate();

  useEffect(() => {
    setEquipamentoLocal(equipamento);
  }, [equipamento]);

  useEffect(() => {
    setStatusAtual(equipamento?.status);
  }, [equipamento?.status]);

  useEffect(() => {
    setResponsavelAtual(equipamento?.responsavel);
  }, [equipamento?.responsavel]);

  useEffect(() => {
    setSetorAtual(equipamento?.setor);
  }, [equipamento?.setor]);

  const {
    inventario,
    loading: loadingInventario,
    error: errorInventario,
  } = useInventario(equipamento?.hostname);

  const {
    historico,
    loading: loadingHistorico,
    error: errorHistorico,
  } = useHistorico(equipamento?.numero_serie);

  if (!equipamento) return <div className="page-loading">Carregando...</div>;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function handleStatusChange(novoStatus) {
    setStatusAtual(novoStatus); // atualização otimista na UI

    const { error } = await supabase
      .from("equipamentos")
      .update({ status: novoStatus })
      .eq("id", equipamento.id);

    if (error) {
      console.error("Erro ao atualizar status:", error);
      setStatusAtual(equipamento.status); // reverte em caso de erro
    }
  }

  async function handleResponsavelChange(novoResponsavel) {
    const anterior = responsavelAtual;
    setResponsavelAtual(novoResponsavel); // atualização otimista

    const { error } = await supabase
      .from("equipamentos")
      .update({ responsavel: novoResponsavel })
      .eq("id", equipamento.id);

    if (error) {
      console.error("Erro ao atualizar responsável:", error);
      setResponsavelAtual(anterior); // reverte em caso de erro
    }
  }

  async function handleSetorChange(novoSetor) {
    const anterior = setorAtual;
    setSetorAtual(novoSetor); // atualização otimista

    const { error } = await supabase
      .from("equipamentos")
      .update({ setor: novoSetor })
      .eq("id", equipamento.id);

    if (error) {
      console.error("Erro ao atualizar setor:", error);
      setSetorAtual(anterior); // reverte em caso de erro
    }
  }

    function handleEditSaved(camposAtualizados) {
      setEquipamentoLocal((prev) => ({ ...prev, ...camposAtualizados }));
      onEquipamentoAtualizado?.(camposAtualizados); // não abre modal nenhum
      setShowEditModal(false);
    }

  return (
    <div className="equipment-page">
      {/* HEADER FIXO */}
      <header className="equipment-header">
        <div className="header-left">
          <Laptop size={62} className="icon-equipment" />
          <div className="header-title-block">
            <h1>{equipamentoLocal.hostname || "Sem hostname"}</h1>
            <span className="subtitle">{equipamentoLocal.dispositivo}</span>
            <div className="last-updated">
              Atualizado em {formatDate(equipamentoLocal.updated_at)}
            </div>
          </div>
        </div>

        <div className="header-right">
          <StatusDropdown
            status={statusAtual}
            onChange={handleStatusChange}
            editable={isAdmin}
          />
          <SetorDropdown
            setor={setorAtual}
            onChange={handleSetorChange}
            editable={isAdmin}
          />
          <ResponsavelAutocomplete
            responsavel={responsavelAtual}
            onChange={handleResponsavelChange}
            editable={isAdmin}
          />

          {isAdmin && (
            <button
              className="btn primary btn-edit-wide"
              onClick={() => setShowEditModal(true)}
            >
              <SquarePen size={16} />
              <span>Editar</span>
            </button>
          )}
          <button onClick={() => navigate(-1)} className="btn-close">
            <X size={22} />
          </button>
        </div>
      </header>

      {/* ABAS */}
      <nav className="equipment-tabs">
        {TABS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`tab ${activeTab === label ? "active" : ""}`}
            onClick={() => setActiveTab(label)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* CONTEÚDO */}
      <div className="equipment-content">
        {activeTab === "Geral" && (
          <GeralTab
            data={{
              ...equipamentoLocal,
              status: statusAtual,
              responsavel: responsavelAtual,
              setor: setorAtual,
            }}
            inventario={inventario}
            loadingInventario={loadingInventario}
            errorInventario={errorInventario}
          />
        )}
        {activeTab === "Hardware" && (
          <HardwareTab data={equipamentoLocal} inventario={inventario} />
        )}
        {activeTab === "Patrimônios" && (
          <PatrimoniosTab data={equipamentoLocal} />
        )}
        {activeTab === "Documentos" && (
          <DocumentosTab equipamentoId={equipamentoLocal.id} />
        )}
        {activeTab === "Histórico" && (
          <HistoricoTab
            historico={historico}
            loading={loadingHistorico}
            error={errorHistorico}
          />
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {showEditModal && (
        <EditEquipamentoModal
          equipamento={equipamentoLocal}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}

/* --- Componentes auxiliares --- */

function Avatar({ name }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
  return <div className="avatar-initial">{initial}</div>;
}

// Bolinha pulsante colorida conforme o status
function StatusIndicator({ status }) {
  const color = getStatusColor(status);
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${color}`}
      />
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`}
      />
    </span>
  );
}

// ===== Ícone padronizado dentro de círculo azul =====
function PillIconCircle({ children }) {
  return <div className="pill-icon-circle">{children}</div>;
}

// ===== Dropdown de Status: pill "Status" que abre menu de opções =====
function StatusDropdown({ status, onChange, editable }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(label) {
    onChange(label);
    setOpen(false);
  }

  return (
    <div className="status-dropdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="status-pill status-pill-clickable"
        onClick={() => editable && setOpen((prev) => !prev)}
        disabled={!editable}
      >
        <PillIconCircle>
          <StatusIndicator status={status} />
        </PillIconCircle>
        <div>
          <div className="pill-value">{status || "-"}</div>
          <div className="pill-label">Status</div>
        </div>
        {editable && <SquarePen size={14} className="status-edit-icon" />}
      </button>

      {open && (
        <div className="status-dropdown-menu">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`status-dropdown-item ${
                opt.label.toLowerCase() === status?.toLowerCase()
                  ? "is-selected"
                  : ""
              }`}
              onClick={() => handleSelect(opt.label)}
            >
              <span className={`status-dropdown-dot ${opt.color}`} />
              <span>{opt.label}</span>
              {opt.label.toLowerCase() === status?.toLowerCase() && (
                <Check size={14} className="ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Dropdown de Setor: pill "Setor" que abre menu de opções =====
function SetorDropdown({ setor, onChange, editable }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nome) {
    onChange(nome);
    setOpen(false);
  }

  return (
    <div className="status-dropdown-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="status-pill status-pill-clickable"
        onClick={() => editable && setOpen((prev) => !prev)}
        disabled={!editable}
      >
        <PillIconCircle>
          <Building2 size={24} className="text-white" />
        </PillIconCircle>
        <div>
          <div className="pill-value">{setor || "-"}</div>
          <div className="pill-label">Setor</div>
        </div>
        {editable && <SquarePen size={14} className="status-edit-icon" />}
      </button>

      {open && (
        <div className="status-dropdown-menu status-dropdown-menu-scroll">
          {SETORES.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`status-dropdown-item ${
                opt.toLowerCase() === setor?.toLowerCase() ? "is-selected" : ""
              }`}
              onClick={() => handleSelect(opt)}
            >
              <span>{opt}</span>
              {opt.toLowerCase() === setor?.toLowerCase() && (
                <Check size={14} className="ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Autocomplete de Responsável =====
function ResponsavelAutocomplete({ responsavel, onChange, editable }) {
  const [editing, setEditing] = useState(false);
  const [valor, setValor] = useState(responsavel || "");
  const [sugestoes, setSugestoes] = useState([]);
  const [todosNomes, setTodosNomes] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loadingSugestoes, setLoadingSugestoes] = useState(false);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setValor(responsavel || "");
  }, [responsavel]);

  useEffect(() => {
    if (!editing) return;

    let ativo = true;

    async function fetchNomes() {
      setLoadingSugestoes(true);
      const { data, error } = await supabase
        .from("equipamentos")
        .select("responsavel")
        .not("responsavel", "is", null)
        .neq("responsavel", "");

      if (!ativo) return;

      if (error) {
        console.error("Erro ao buscar sugestões de responsáveis:", error);
        setTodosNomes([]);
      } else {
        const nomesUnicos = Array.from(
          new Set(data.map((item) => item.responsavel?.trim()).filter(Boolean)),
        ).sort((a, b) => a.localeCompare(b, "pt-BR"));
        setTodosNomes(nomesUnicos);
      }
      setLoadingSugestoes(false);
    }

    fetchNomes();

    return () => {
      ativo = false;
    };
  }, [editing]);

  useEffect(() => {
    if (!editing) return;

    const termo = valor.trim().toLowerCase();

    if (!termo) {
      setSugestoes(todosNomes.slice(0, 8));
    } else {
      const filtradas = todosNomes.filter((nome) =>
        nome.toLowerCase().includes(termo),
      );
      setSugestoes(filtradas.slice(0, 8));
    }
    setHighlightIndex(-1);
  }, [valor, todosNomes, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        handleCancel();
      }
    }
    if (editing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing]);

  function handleSave(nomeEscolhido) {
    const nomeFinal = (nomeEscolhido ?? valor).trim();
    if (nomeFinal && nomeFinal !== responsavel) {
      onChange(nomeFinal);
    }
    setEditing(false);
  }

  function handleCancel() {
    setValor(responsavel || "");
    setEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < sugestoes.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && sugestoes[highlightIndex]) {
        setValor(sugestoes[highlightIndex]);
        handleSave(sugestoes[highlightIndex]);
      } else {
        handleSave();
      }
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  function handleSelectSugestao(nome) {
    setValor(nome);
    handleSave(nome);
  }

  if (editing) {
    return (
      <div className="status-pill responsavel-editing" ref={wrapperRef}>
        <PillIconCircle>
          <Avatar name={valor} />
        </PillIconCircle>

        <div className="responsavel-input-block">
          <input
            ref={inputRef}
            type="text"
            className="responsavel-input"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome do responsável"
            autoComplete="off"
          />
          <div className="pill-label">Responsável</div>

          {(sugestoes.length > 0 || loadingSugestoes) && (
            <div className="responsavel-suggestions">
              {loadingSugestoes && (
                <div className="responsavel-suggestion-loading">
                  Carregando...
                </div>
              )}
              {!loadingSugestoes &&
                sugestoes.map((nome, index) => (
                  <button
                    key={nome}
                    type="button"
                    className={`responsavel-suggestion-item ${
                      index === highlightIndex ? "highlighted" : ""
                    }`}
                    onMouseEnter={() => setHighlightIndex(index)}
                    onClick={() => handleSelectSugestao(nome)}
                  >
                    <Avatar name={nome} />
                    <span>{nome}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="status-pill status-pill-clickable"
      onClick={() => editable && setEditing(true)}
      disabled={!editable}
    >
      <PillIconCircle>
        <Avatar name={responsavel} />
      </PillIconCircle>
      <div>
        <div className="pill-value">{responsavel || "-"}</div>
        <div className="pill-label">Responsável</div>
      </div>
      {editable && <SquarePen size={14} className="status-edit-icon" />}
    </button>
  );
}

function StatusPill({ label, value, icon }) {
  return (
    <div className="status-pill">
      <PillIconCircle>{icon}</PillIconCircle>
      <div>
        <div className="pill-value">{value || "-"}</div>
        <div className="pill-label">{label}</div>
      </div>
    </div>
  );
}

function Card({ title, children, span }) {
  return (
    <div className={`info-card ${span ? "span-full" : ""}`}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "-"}</span>
    </div>
  );
}

function StatusBadge({
  ativo,
  labelAtivo = "Ativo",
  labelInativo = "Inativo",
}) {
  return (
    <span className={`modal-tag ${ativo ? "active" : "inactive"}`}>
      {ativo ? <Check size={14} /> : <X size={14} />}{" "}
      {ativo ? labelAtivo : labelInativo}
    </span>
  );
}

// Card dedicado ao Antivírus
function AntivirusCard({ ativo, nome }) {
  return (
    <div className="antivirus-card">
      <div className="antivirus-card-topbar" />

      <div className="antivirus-card-body">
        <div className="antivirus-card-header">
          <div className="antivirus-card-header-text">
            <span className="antivirus-card-label">PROTEÇÃO</span>
            <h3 className="antivirus-card-title">Antivírus</h3>
          </div>

          <div className="antivirus-card-shield-wrapper">
            <Shield
              size={40}
              className="antivirus-card-shield-icon"
              strokeWidth={1.5}
            />
            <span
              className={`antivirus-card-shield-badge ${
                ativo ? "is-ok" : "is-danger"
              }`}
            >
              {ativo ? <Check size={12} /> : <X size={12} />}
            </span>
          </div>
        </div>

        <hr className="antivirus-card-divider" />

        <div className="antivirus-card-row">
          <span className="antivirus-card-row-label">Status</span>
          <span
            className={`antivirus-card-status-pill ${
              ativo ? "is-ok" : "is-danger"
            }`}
          >
            {ativo ? <Check size={14} /> : <X size={14} />}
            {ativo ? "Habilitado" : "Desabilitado"}
          </span>
        </div>

        <div className="antivirus-card-row">
          <span className="antivirus-card-row-label">Software</span>
          <span className="antivirus-card-row-value">
            {nome || "Não identificado"}
          </span>
        </div>
      </div>
    </div>
  );
}

function FirewallCard({ ativo }) {
  return (
    <div className="firewall-card">
      <div className="firewall-card-topbar" />

      <div className="firewall-card-body">
        <div className="firewall-card-header">
          <div className="firewall-card-header-text">
            <span className="firewall-card-label">PROTEÇÃO</span>
            <h3 className="firewall-card-title">Firewall</h3>
          </div>

          <div className="firewall-card-shield-wrapper">
            <BrickWallShield
              size={40}
              className="firewall-card-shield-icon"
              strokeWidth={1.5}
            />
            <span
              className={`firewall-card-shield-badge ${
                ativo ? "is-ok" : "is-danger"
              }`}
            >
              {ativo ? <Check size={12} /> : <X size={12} />}
            </span>
          </div>
        </div>

        <hr className="firewall-card-divider" />

        <div className="firewall-card-row">
          <span className="firewall-card-row-label">Status</span>
          <span
            className={`firewall-card-status-pill ${
              ativo ? "is-ok" : "is-danger"
            }`}
          >
            {ativo ? <Check size={14} /> : <X size={14} />}
            {ativo ? "Habilitado" : "Desabilitado"}
          </span>
        </div>

        <div className="firewall-card-row">
          <span className="firewall-card-row-label">Detecção</span>
          <span className="firewall-card-row-value">
            {ativo ? "Firewall ativo" : "Firewall inativo"}
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoGeraisCard({ dispositivo, modelo,processador,numeroSerie, posse }) {
  return (
    <div className="infogerais-card">
      <div className="infogerais-card-topbar" />
      <div className="infogerais-card-body">
        <div className="infogerais-card-header">
          <div className="infogerais-card-header-text">
            <span className="infogerais-card-label">DISPOSITIVO</span>
            <h3 className="infogerais-card-title">Informações Gerais</h3>
          </div>
          <div className="infogerais-card-icon-wrapper">
            <Laptop
              size={36}
              className="infogerais-card-icon"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <hr className="infogerais-card-divider" />
        <div className="infogerais-card-row">
          <span className="infogerais-card-row-label">Dispositivo</span>
          <span className="infogerais-card-row-value">
            {dispositivo || "-"}
          </span>
        </div>
        <div className="infogerais-card-row">
          <span className="infogerais-card-row-label">Modelo</span>
          <span className="infogerais-card-row-value">{modelo || "-"}</span>
        </div>
                <div className="infogerais-card-row">
          <span className="infogerais-card-row-label">Processador</span>
          <span className="infogerais-card-row-value">{processador || "-"}</span>
        </div>
        <div className="infogerais-card-row">
          <span className="infogerais-card-row-label">Nº de Série</span>
          <span className="infogerais-card-row-value">
            {numeroSerie || "-"}
          </span>
        </div>
                <div className="infogerais-card-row">
          <span className="infogerais-card-row-label">Posse</span>
          <span className="infogerais-card-posse-value">{posse || "-"}</span>
        </div>
      </div>
    </div>
  );
}




// ===== Card de Tempo de Atividade (Uptime) =====
function UptimeCard({ uptimeHoras }) {
  const [segundosDecorridos, setSegundosDecorridos] = useState(0);

  useEffect(() => {
    if (uptimeHoras == null) return;

    setSegundosDecorridos(0);

    const intervalo = setInterval(() => {
      setSegundosDecorridos((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [uptimeHoras]);

  if (uptimeHoras == null) return null;

  const LIMITE_SEGUNDOS = 14 * 86400;

  const totalSegundos = Math.floor(uptimeHoras * 3600) + segundosDecorridos;

  const dias = Math.floor(totalSegundos / 86400);
  const horas = Math.floor((totalSegundos % 86400) / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);

  const excedeSeteDias = dias >= 7;

  const progresso = Math.min((totalSegundos / LIMITE_SEGUNDOS) * 100, 100);

  const tempoFormatado =
    dias > 0 ? `${dias}d ${horas}h ${minutos}m` : `${horas}h ${minutos}m`;

  return (
    <div className="uptime-card">
      <div className="uptime-card-topbar" />

      <div className="uptime-card-body">
        <div className="uptime-card-header">
          <div className="uptime-card-header-text">
            <span className="uptime-card-label">SISTEMA</span>
            <h3 className="uptime-card-title">Tempo de Atividade</h3>
          </div>

          <div className="uptime-card-clock-wrapper">
            <RotateCcwClock
              size={22}
              className="uptime-card-clock-icon"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <hr className="uptime-card-divider" />

        <div className="uptime-card-row">
          <span className="uptime-card-row-label">Em execução</span>
          <span className="uptime-card-time-value">{tempoFormatado}</span>
        </div>

        <div className="uptime-progress-bar">
          <div
            className={`uptime-progress-fill ${
              excedeSeteDias ? "is-danger" : "is-ok"
            }`}
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="uptime-progress-scale">
          <span>0</span>
          <span>7d</span>
          <span>14d</span>
        </div>

        <div className="uptime-card-row uptime-card-row-condicao">
          <span className="uptime-card-row-label">Condição</span>
          <span
            className={`uptime-card-status-pill ${
              excedeSeteDias ? "is-danger" : "is-ok"
            }`}
          >
            {excedeSeteDias
              ? "Reinicialização recomendada"
              : "Desempenho ideal"}
          </span>
        </div>
      </div>
    </div>
  );
}


function GeralTab({ data, inventario }) {
  const uptimeHoras =
    inventario?.sistema?.uptime_hours ?? data.uptime_horas ?? null;

  const hw = inventario?.hardware;
  const sis = inventario?.sistema;

  const versaoCompleta =
    sis?.os_version || data.sistema_operacional || "Não identificado";

  const match = versaoCompleta.match(
    /^(Microsoft Windows \d+)\s+(.+?)\s+(\d+\.\d+\.\d+)$/,
  );
  const processadorResumido = resumirProcessador(
    hw?.cpu_model || data.processador,
  );
  const edicaoWindows = match ? match[2] : "-";
  const buildWindows = match ? match[3] : "-";

  const dataInstalacaoBruta =
    sis?.install_date || data.data_instalacao_windows || null;

  const chaveLicenca = sis?.license_key || data.chave_licenca_windows || null;
  const serial = data.numero_serie || null;

  return (
    <div className="geral-tab-layout">
      {/* Coluna esquerda: Info Gerais + Windows */}
      <div className="geral-tab-col-left">
        <InfoGeraisCard
          dispositivo={data.dispositivo}
          modelo={data.modelo}
          processador={processadorResumido}
          numeroSerie={hw?.numero_serie || data.numero_serie}
          posse={data.posse}
        />

        <WindowsLicenseCard
          edicao={edicaoWindows}
          build={buildWindows}
          instaladoEm={dataInstalacaoBruta}
          chaveLicenca={chaveLicenca}
          serial={serial}
          ativado={data.windows_ativado}
        />
      </div>

      {/* Coluna direita: Tempo de Atividade + (Antivírus + Firewall) */}
      <div className="geral-tab-col-right">
        {uptimeHoras != null && <UptimeCard uptimeHoras={uptimeHoras} />}

        <div className="geral-tab-row-av-fw">
          {data.hostname && (
            <AntivirusCard
              ativo={data.antivirus_ativo}
              nome={data.antivirus_name}
            />
          )}

          {data.hostname && <FirewallCard ativo={data.firewall_ativo} />}
        </div>
      </div>
    </div>
  );
}


// ===== Card individual de Patrimônio =====
function PatrimonioCard({ titulo, numero, icon: Icon, possui }) {
  return (
    <div className="patrimonio-card">
      <div className="patrimonio-card-icon-area">
        <Icon size={64} className="patrimonio-card-icon" strokeWidth={1.5} />
      </div>

      <div className="patrimonio-card-footer">
        <span className="patrimonio-card-title">{titulo}</span>

        <div className="patrimonio-card-row">
          <span className="patrimonio-card-subtitle">Patrimônio</span>
          <span className="patrimonio-card-numero">{numero || "-"}</span>
        </div>

        {possui !== undefined && (
          <div className="patrimonio-card-row">
            <span className="patrimonio-card-subtitle">Possui</span>
            <span
              className={`patrimonio-card-possui ${
                possui ? "is-sim" : "is-nao"
              }`}
            >
              {possui ? "Sim" : "Não"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function HardwareTab({ data, inventario }) {
  const hw = inventario?.hardware;
  const sis = inventario?.sistema;
  const rede = inventario?.rede;

  const memoriaValue = hw?.total_ram_gb
    ? `${hw.total_ram_gb.toFixed(1)} GB`
    : data.memoria;

  const discoLivre = hw?.disk_free_gb ?? data.disco_livre_gb;
  const discoTotal = hw?.disk_total_gb ?? data.disco_total_gb;
  const temArmazenamento = discoTotal != null || discoLivre != null;

  const temRede =
    rede?.ip_local ||
    rede?.wifi_ssid ||
    rede?.mac_address ||
    data.ip_local ||
    data.wifi_ssid;

  return (
    <div className="cards-grid">
      <Card title="Especificações Técnicas" span>
        <InfoItem
          label="Fabricante"
          value={hw?.fabricante || data.fabricante}
        />
        <InfoItem label="Dispositivo" value={data.dispositivo} />
        <InfoItem label="Modelo" value={data.modelo} />
        <InfoItem
          label="Processador"
          value={hw?.cpu_model || data.processador}
        />
        <InfoItem
          label="Núcleos"
          value={hw?.cpu_cores || data.processador_cores}
        />
        <InfoItem label="Memória" value={memoriaValue} />

        <InfoItem
          label="Nº de Série"
          value={hw?.numero_serie || data.numero_serie}
        />
      </Card>

      {temArmazenamento && (
        <Card title="Armazenamento">
          <InfoItem
            label="Espaço Livre"
            value={
              discoLivre != null
                ? `${discoLivre.toFixed(1)} GB de ${discoTotal?.toFixed(1)} GB`
                : "-"
            }
          />
        </Card>
      )}

      {temRede && (
        <Card title="Rede">
          <InfoItem label="Tipo de Conexão" value={data.tipo_conexao} />
          <InfoItem label="IP Local" value={rede?.ip_local || data.ip_local} />
          <InfoItem label="MAC (Rede)" value={rede?.mac_address || data.mac} />
          {data.tipo_conexao === "Wi-Fi" && (
            <InfoItem label="Wi-Fi" value={rede?.wifi_ssid || data.wifi_ssid} />
          )}
        </Card>
      )}
    </div>
  );
}

function WindowsTab({ data, inventario }) {
  const sis = inventario?.sistema;

  const versaoCompleta =
    sis?.os_version || data.sistema_operacional || "Não identificado";

  const match = versaoCompleta.match(
    /^(Microsoft Windows \d+)\s+(.+?)\s+(\d+\.\d+\.\d+)$/,
  );

  const edicao = match ? match[2] : "-";
  const build = match ? match[3] : "-";

  const dataInstalacaoBruta =
    sis?.install_date || data.data_instalacao_windows || null;

  const chaveLicenca = sis?.license_key || data.chave_licenca_windows || null;
  const serial = data.numero_serie || null;

  return (
    <div className="cards-grid">
      <WindowsLicenseCard
        edicao={edicao}
        build={build}
        instaladoEm={dataInstalacaoBruta}
        chaveLicenca={chaveLicenca}
        serial={serial}
        ativado={data.windows_ativado}
      />
    </div>
  );
}

function formatarDataBR(isoDate) {
  const data = isoDate.split("T")[0];
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
}

function PatrimoniosTab({ data }) {
  const patrimonios = [
    {
      titulo: "Dispositivo",
      numero: data.patrimonio_dispositivo,
      icon: MonitorSpeaker,
    },
    {
      titulo: "Carregador",
      numero: data.patrimonio_carregador,
      icon: Cable,
    },
    {
      titulo: "Monitor",
      numero: data.patrimonio_monitor,
      icon: Monitor,
      possui: !!data.monitor,
    },
    {
      titulo: "Leitor Biométrico",
      numero: data.patrimonio_leitor_biometrico,
      icon: Fingerprint,
      possui: !!data.leitor_biometrico,
    },
    {
      titulo: "Fone",
      numero: data.patrimonio_fone,
      icon: Headphones,
      possui: !!data.fone,
    },
    {
      titulo: "Hub USB",
      numero: data.patrimonio_hub_usb,
      icon: Usb,
      possui: !!data.hub_usb,
    },
    {
      titulo: "Webcam",
      numero: data.patrimonio_webcam,
      icon: Webcam,
      possui: !!data.webcam,
    },
  ];

  return (
    <div className="patrimonios-grid">
      {patrimonios.map((item) => (
        <PatrimonioCard
          key={item.titulo}
          titulo={item.titulo}
          numero={item.numero}
          icon={item.icon}
          possui={item.possui}
        />
      ))}
    </div>
  );
}
/* ================================================================
   ===== ABA DOCUMENTOS — NOVA IMPLEMENTAÇÃO (drag&drop + tabela) =====
   ================================================================ */

function getFileTypeInfo(nomeArquivo) {
  const ext = nomeArquivo.split(".").pop()?.toLowerCase() || "";

  const map = {
    pdf: { label: "PDF", icon: FileText },
    zip: { label: "ZIP", icon: FileArchive },
    rar: { label: "RAR", icon: FileArchive },
    xlsx: { label: "XLSX", icon: FileSpreadsheet },
    xls: { label: "XLS", icon: FileSpreadsheet },
    csv: { label: "CSV", icon: FileSpreadsheet },
    mp3: { label: "MP3", icon: Music },
    wav: { label: "WAV", icon: Music },
    mp4: { label: "MP4", icon: Video },
    mov: { label: "MOV", icon: Video },
    jpg: { label: "JPG", icon: FileImage },
    jpeg: { label: "JPEG", icon: FileImage },
    png: { label: "PNG", icon: FileImage },
  };

  return map[ext] || { label: ext.toUpperCase() || "FILE", icon: FileText };
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 byte";
  const k = 1024;
  const sizes = ["byte", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(0))} ${sizes[i]}`;
}

function DocumentosTab({ equipamentoId }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocumentos();
  }, [equipamentoId]);

  async function fetchDocumentos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("documentos_equipamento")
      .select("*")
      .eq("equipamento_id", equipamentoId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar documentos:", error);
      setErro("Não foi possível carregar os documentos.");
    } else {
      setDocumentos(data || []);
    }
    setLoading(false);
  }

  async function uploadFile(file) {
    setUploading(true);
    setErro(null);

    try {
      const extensao = file.name.split(".").pop();
      const nomeArquivo = `${equipamentoId}/${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(nomeArquivo, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documentos")
        .getPublicUrl(nomeArquivo);

      const { error: insertError } = await supabase
        .from("documentos_equipamento")
        .insert({
          equipamento_id: equipamentoId,
          nome_arquivo: file.name,
          caminho_storage: nomeArquivo,
          tamanho_bytes: file.size,
          url: urlData.publicUrl,
        });

      if (insertError) throw insertError;

      await fetchDocumentos();
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      setErro("Erro ao enviar o documento. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    files.forEach(uploadFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach(uploadFile);
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Remover o documento "${doc.nome_arquivo}"?`)) return;

    const { error: storageError } = await supabase.storage
      .from("documentos")
      .remove([doc.caminho_storage]);

    if (storageError) {
      console.error("Erro ao remover do storage:", storageError);
    }

    const { error: deleteError } = await supabase
      .from("documentos_equipamento")
      .delete()
      .eq("id", doc.id);

    if (deleteError) {
      console.error("Erro ao remover registro:", deleteError);
      setErro("Não foi possível remover o documento.");
      return;
    }

    setDocumentos((prev) => prev.filter((d) => d.id !== doc.id));
  }

  function handleDownload(doc) {
    window.open(doc.url, "_blank");
  }

  return (
    <div className="cards-grid">
      <Card title="Área de Upload" span>
        <div
          className={`upload-dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.zip,.rar,.xlsx,.xls,.csv,.mp3,.mp4"
            onChange={handleFileChange}
            disabled={uploading}
            className="documentos-input-hidden"
          />
          <UploadCloud size={36} className="upload-dropzone-icon" />
          <p className="upload-dropzone-title">
            {uploading
              ? "Enviando arquivo..."
              : "Arraste e solte ou clique para enviar"}
          </p>
          <p className="upload-dropzone-subtitle">
            PDF, ZIP, XLSX, MP3, MP4, JPG, PNG — até 50 MB
          </p>
        </div>

        {erro && <span className="error">{erro}</span>}
      </Card>

      <Card title={`Files (${documentos.length})`} span>
        {loading ? (
          <p className="info-empty">Carregando documentos...</p>
        ) : documentos.length === 0 ? (
          <p className="info-empty">Nenhum documento cadastrado.</p>
        ) : (
          <div className="documentos-table">
            <div className="documentos-table-header">
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Actions</span>
            </div>

            {documentos.map((doc) => {
              const { label, icon: Icon } = getFileTypeInfo(doc.nome_arquivo);
              return (
                <div key={doc.id} className="documentos-table-row">
                  <div className="documentos-table-name">
                    <Icon size={18} />
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      {doc.nome_arquivo}
                    </a>
                  </div>
                  <span className="documentos-table-type">{label}</span>
                  <span className="documentos-table-size">
                    {formatFileSize(doc.tamanho_bytes)}
                  </span>
                  <div className="documentos-table-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => handleDownload(doc)}
                      title="Baixar"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn documento-delete-btn"
                      onClick={() => handleDelete(doc)}
                      title="Remover"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}


function HistoricoTab({ historico, loading, error }) {
  if (loading) {
    return (
      <div className="cards-grid">
        <Card title="Histórico de Responsáveis" span>
          <p className="info-empty">Carregando histórico...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cards-grid">
        <Card title="Histórico de Responsáveis" span>
          <p className="info-empty">Erro ao carregar histórico: {error}</p>
        </Card>
      </div>
    );
  }

  if (!historico || historico.length === 0) {
    return (
      <div className="cards-grid">
        <Card title="Histórico de Responsáveis" span>
          <p className="info-empty">Nenhuma transferência registrada.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="cards-grid">
      <Card title="Histórico de Responsáveis" span>
        <div className="historico-list">
          {historico.map((item) => (
            <div key={item.id} className="historico-item">
              <div className="historico-avatar">
                <Avatar name={item.responsavel} />
              </div>
              <div className="historico-info">
                <span className="historico-nome">{item.responsavel}</span>
                {item.setor && (
                  <span className="historico-setor">{item.setor}</span>
                )}
              </div>
              <div className="historico-data">
                {formatDateHistorico(item.data_transferencia)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function formatDateHistorico(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===== Modal de Edição (Dispositivo, Patrimônios, Posse, Acessórios) =====
function EditEquipamentoModal({ equipamento, onClose, onSaved }) {
  const [form, setForm] = useState({
    dispositivo: equipamento.dispositivo || "",
    posse: equipamento.posse || "",
    patrimonio_dispositivo: equipamento.patrimonio_dispositivo || "",
    patrimonio_carregador: equipamento.patrimonio_carregador || "",
    patrimonio_monitor: equipamento.patrimonio_monitor || "",
    patrimonio_leitor_biometrico:
      equipamento.patrimonio_leitor_biometrico || "",
    monitor: !!equipamento.monitor,
    hub_usb: !!equipamento.hub_usb,
    webcam: !!equipamento.webcam,
    leitor_biometrico: !!equipamento.leitor_biometrico,
    fone: !!equipamento.fone,
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErro(null);

    const { error } = await supabase
      .from("equipamentos")
      .update(form)
      .eq("id", equipamento.id);

    setSaving(false);

    if (error) {
      console.error("Erro ao salvar edição:", error);
      setErro("Não foi possível salvar as alterações.");
      return;
    }

    onSaved(form);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Equipamento</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Dispositivo */}
            <div className="modal-section">
              <h3>Dispositivo</h3>
              <Dropdown
                label="Dispositivo *"
                name="dispositivo"
                value={form.dispositivo}
                onChange={handleChange}
                options={DISPOSITIVOS}
              />
            </div>

            {/* Posse */}
            <div className="modal-section">
              <h3>Posse</h3>
              <Dropdown
                label="Posse"
                name="posse"
                value={form.posse}
                onChange={handleChange}
                options={POSSES}
              />
            </div>

            {/* Patrimônios */}
            <div className="modal-section">
              <h3>Patrimônios</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Dispositivo</label>
                  <input
                    type="text"
                    name="patrimonio_dispositivo"
                    value={form.patrimonio_dispositivo}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Carregador</label>
                  <input
                    type="text"
                    name="patrimonio_carregador"
                    value={form.patrimonio_carregador}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Monitor</label>
                  <input
                    type="text"
                    name="patrimonio_monitor"
                    value={form.patrimonio_monitor}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label>Leitor Biométrico</label>
                  <input
                    type="text"
                    name="patrimonio_leitor_biometrico"
                    value={form.patrimonio_leitor_biometrico}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Acessórios */}
            <div className="modal-section">
              <h3>Acessórios</h3>
              <div className="toogle-group">
                <ToogleSwitch
                  label="Monitor"
                  checked={form.monitor}
                  onChange={(val) => setForm({ ...form, monitor: val })}
                />
                <ToogleSwitch
                  label="Hub USB"
                  checked={form.hub_usb}
                  onChange={(val) => setForm({ ...form, hub_usb: val })}
                />
                <ToogleSwitch
                  label="Webcam"
                  checked={form.webcam}
                  onChange={(val) => setForm({ ...form, webcam: val })}
                />
                <ToogleSwitch
                  label="Leitor Biométrico"
                  checked={form.leitor_biometrico}
                  onChange={(val) =>
                    setForm({ ...form, leitor_biometrico: val })
                  }
                />
                <ToogleSwitch
                  label="Fone"
                  checked={form.fone}
                  onChange={(val) => setForm({ ...form, fone: val })}
                />
              </div>
            </div>

            {erro && <span className="error">{erro}</span>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
