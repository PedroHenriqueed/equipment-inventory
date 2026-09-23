import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Laptop,
  Building2,
  Pencil,
  SquarePen,
  Check,
  X,
  Bolt,
  MonitorCog,
  TicketsPlane,
  LayoutDashboard,
  BrickWallShield,
  ShieldCheck,
  ShieldX,
  Shield,
  TriangleAlert,
  CircleCheckBig,
  FileText,
} from "lucide-react";
import { useInventario } from "../hooks/useInventario"; // ajuste o path se necessário
import { useHistorico } from "../hooks/useHistorico"; // ajuste o path se necessário
import { supabase } from "../lib/supabaseClient"; // ajuste o path se necessário
import { SETORES } from "../constants/options"; // ✅ import corrigido

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

// Cada aba agora tem seu ícone
const TABS = [
  { label: "Geral", icon: Bolt },
  { label: "Hardware", icon: MonitorCog },
  { label: "Windows", icon: WindowsIcon },
  { label: "Patrimônios", icon: TicketsPlane },
  { label: "Acessórios", icon: LayoutDashboard },
  { label: "Histórico", icon: FileText },
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

export default function EquipmentPage({ equipamento, isAdmin, onEdit }) {
  const [activeTab, setActiveTab] = useState("Geral");
  const [statusAtual, setStatusAtual] = useState(equipamento?.status);
  const [responsavelAtual, setResponsavelAtual] = useState(
    equipamento?.responsavel,
  );
  const [setorAtual, setSetorAtual] = useState(equipamento?.setor);
  const navigate = useNavigate();

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

  return (
    <div className="equipment-page">
      {/* HEADER FIXO */}
      <header className="equipment-header">
        <div className="header-left">
          <Laptop size={62} className="icon-equipment" />
          <div className="header-title-block">
            <h1>{equipamento.hostname || "Sem hostname"}</h1>
            <span className="subtitle">{equipamento.dispositivo}</span>
            <div className="last-updated">
              Atualizado em {formatDate(equipamento.updated_at)}
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
            <button className="btn primary btn-edit-wide" onClick={onEdit}>
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
              ...equipamento,
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
          <HardwareTab data={equipamento} inventario={inventario} />
        )}
        {activeTab === "Windows" && (
          <WindowsTab data={equipamento} inventario={inventario} />
        )}
        {activeTab === "Patrimônios" && <PatrimoniosTab data={equipamento} />}
        {activeTab === "Acessórios" && <AcessoriosTab data={equipamento} />}
        {activeTab === "Histórico" && (
          <HistoricoTab
            historico={historico}
            loading={loadingHistorico}
            error={errorHistorico}
          />
        )}
      </div>
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
// Usado por Status e Setor para ficarem visualmente iguais ao Responsável (Avatar)
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
          <Building2 size={14} className="text-white" />
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

  // Busca todos os responsáveis distintos já cadastrados (uma vez, ao abrir a edição)
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

  // Filtra as sugestões conforme o usuário digita
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

// Card dedicado ao Antivírus — ícone grande à esquerda + título/subtítulo à direita
function AntivirusCard({ ativo, nome }) {
  return (
    <div className={`status-card ${ativo ? "is-ok" : "is-danger"}`}>
      <div className="status-card-text">
        <h3 className="status-card-title">
          {ativo
            ? "O antivírus está habilitado"
            : "O antivírus está desabilitado"}
        </h3>
        <span className="status-card-subtitle">
          {nome || "Antivírus não identificado"}
        </span>
      </div>

      <div className="status-icon-wrapper">
        <Shield size={40} className="status-card-icon" />
        {ativo ? (
          <Check size={16} className="status-badge status-badge-ok" />
        ) : (
          <X size={16} className="status-badge status-badge-danger" />
        )}
      </div>
    </div>
  );
}

function FirewallCard({ ativo }) {
  return (
    <div className={`status-card ${ativo ? "is-ok" : "is-danger"}`}>
      <div className="status-card-text">
        <h3 className="status-card-title">
          {ativo
            ? "O firewall está habilitado"
            : "O firewall está desabilitado"}
        </h3>
        <span className="status-card-subtitle">Firewall foi detectado</span>
      </div>

      <div className="status-icon-wrapper">
        <BrickWallShield size={40} className="status-card-icon" />
        {ativo ? (
          <Check size={16} className="status-badge status-badge-ok" />
        ) : (
          <X size={16} className="status-badge status-badge-danger" />
        )}
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

  const totalSegundos = Math.floor(uptimeHoras * 3600) + segundosDecorridos;

  const dias = Math.floor(totalSegundos / 86400);
  const horas = Math.floor((totalSegundos % 86400) / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const pad = (n) => String(n).padStart(2, "0");

  const excedeSeteDias = dias >= 7;

  const tempoFormatado =
    dias > 0
      ? `${dias}d ${pad(horas)}h ${pad(minutos)}m ${pad(segundos)}s`
      : `${pad(horas)}h ${pad(minutos)}m ${pad(segundos)}s`;

  return (
    <div className={`status-card ${excedeSeteDias ? "is-warning" : "is-ok"}`}>
      <div className="status-card-text">
        <h3 className="status-card-title">Tempo de Atividade</h3>
        <span className="status-card-subtitle uptime-counter">
          {tempoFormatado}
        </span>
        <span
          className={`uptime-status-label ${
            excedeSeteDias ? "text-warning" : "text-success"
          }`}
        >
          {excedeSeteDias ? "Reinicialização recomendada" : "Desempenho ideal"}
        </span>
      </div>

      <div className="status-icon-wrapper">
        {excedeSeteDias ? (
          <TriangleAlert size={40} className="status-card-icon text-warning" />
        ) : (
          <CircleCheckBig size={40} className="status-card-icon text-success" />
        )}
      </div>
    </div>
  );
}

function GeralTab({ data, inventario }) {
  const uptimeHoras =
    inventario?.sistema?.uptime_hours ?? data.uptime_horas ?? null;
  return (
    <div className="cards-grid">
      {data.hostname && (
        <AntivirusCard
          ativo={data.antivirus_ativo}
          nome={data.antivirus_name}
        />
      )}

      {data.hostname && <FirewallCard ativo={data.firewall_ativo} />}

      <Card title="Informações Gerais">
        <InfoItem label="Responsável" value={data.responsavel} />
        <InfoItem label="Setor" value={data.setor} />
        <InfoItem label="Dispositivo" value={data.dispositivo} />
        <InfoItem label="Modelo" value={data.modelo} />
        <InfoItem label="Posse" value={data.posse} />
      </Card>

      {uptimeHoras != null && <UptimeCard uptimeHoras={uptimeHoras} />}

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

  const titulo = match ? match[1] : versaoCompleta;
  const edicao = match ? match[2] : "-";
  const build = match ? match[3] : "-";

  const dataInstalacaoBruta =
    sis?.install_date || data.data_instalacao_windows || null;
  const dataInstalacao = dataInstalacaoBruta
    ? formatarDataBR(dataInstalacaoBruta)
    : "-";

  const chaveLicenca = sis?.license_key || data.chave_licenca_windows || "-";

  return (
    <div className="cards-grid">
      <Card span>
        <div className="windows-card-header">
          <WindowsIcon size={40} color="#ffffff" />
          <h3 className="windows-card-title">{titulo}</h3>
        </div>

        <div className="windows-info-grid">
          <InfoItem label="Edição" value={edicao} />
          <InfoItem label="Compilação" value={build} />
          <InfoItem label="Data de Instalação" value={dataInstalacao} />
          <InfoItem label="Chave da Licença" value={chaveLicenca} />
        </div>
      </Card>
    </div>
  );
}

function formatarDataBR(isoDate) {
  const data = isoDate.split("T")[0];
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
}

function PatrimoniosTab({ data }) {
  return (
    <div className="cards-grid">
      <Card title="Patrimônios" span>
        <InfoItem label="Dispositivo" value={data.patrimonio_dispositivo} />
        <InfoItem label="Carregador" value={data.patrimonio_carregador} />
        <InfoItem label="Monitor" value={data.patrimonio_monitor} />
        <InfoItem
          label="Leitor Biométrico"
          value={data.patrimonio_leitor_biometrico}
        />
      </Card>
    </div>
  );
}

function AcessoriosTab({ data }) {
  const items = [
    { label: "Monitor", active: data.monitor },
    { label: "Hub USB", active: data.hub_usb },
    { label: "Webcam", active: data.webcam },
    { label: "Leitor Biométrico", active: data.leitor_biometrico },
    { label: "Fone", active: data.fone },
  ];
  return (
    <div className="cards-grid">
      <Card title="Acessórios" span>
        <div className="tags-row">
          {items.map((item) => (
            <span
              key={item.label}
              className={`modal-tag ${item.active ? "active" : "inactive"}`}
            >
              {item.active ? <Check size={14} /> : <X size={14} />} {item.label}
            </span>
          ))}
        </div>
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
