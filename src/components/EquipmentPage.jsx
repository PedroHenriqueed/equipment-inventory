import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Laptop,
  CircleDot,
  Building2,
  Pencil,
  Check,
  X,
  Bolt,
  MonitorCog,
  TicketsPlane,
  LayoutDashboard,
} from "lucide-react";

// Cada aba agora tem seu ícone
const TABS = [
  { label: "Geral", icon: Bolt },
  { label: "Hardware", icon: MonitorCog },
  { label: "Patrimônios", icon: TicketsPlane },
  { label: "Acessórios", icon: LayoutDashboard },
];

export default function EquipmentPage({ equipamento, isAdmin, onEdit }) {
  const [activeTab, setActiveTab] = useState("Geral");
  const navigate = useNavigate();

  if (!equipamento) return <div className="page-loading">Carregando...</div>;

  // Formata data da última atualização
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

  return (
    <div className="equipment-page">
      {/* HEADER FIXO */}
      <header className="equipment-header">
        <div className="header-left">
          <Laptop size={62} className="icon-equipment" />
          <div className="header-title-block">
            <h1>{equipamento.hostname}</h1>
            <span className="subtitle">{equipamento.dispositivo}</span>
            <div className="last-updated">
              Atualizado em {formatDate(equipamento.updated_at)}
            </div>
          </div>
        </div>

        <div className="header-right">
          <StatusPill
            label="Estado"
            value={equipamento.status}
            icon={<CircleDot size={18} className="text-pink-400" />}
          />
          <StatusPill
            label="Setor"
            value={equipamento.setor}
            icon={<Building2 size={18} className="text-blue-400" />}
          />
          <StatusPill
            label="Responsável"
            value={equipamento.responsavel}
            icon={<Avatar name={equipamento.responsavel} />}
          />

          {isAdmin && (
            <button className="btn primary btn-edit-wide" onClick={onEdit}>
              <Pencil size={16} />
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
        {activeTab === "Geral" && <GeralTab data={equipamento} />}
        {activeTab === "Hardware" && <HardwareTab data={equipamento} />}
        {activeTab === "Patrimônios" && <PatrimoniosTab data={equipamento} />}
        {activeTab === "Acessórios" && <AcessoriosTab data={equipamento} />}
      </div>
    </div>
  );
}

/* --- Componentes auxiliares --- */

// Avatar com a inicial do nome do responsável (substitui o ícone User)
function Avatar({ name }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
  return <div className="avatar-initial">{initial}</div>;
}

function StatusPill({ label, value, icon }) {
  return (
    <div className="status-pill">
      <span className="pill-icon">{icon}</span>
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

function GeralTab({ data }) {
  return (
    <div className="cards-grid">
      <Card title="Informações Gerais">
        <InfoItem label="Responsável" value={data.responsavel} />
        <InfoItem label="Setor" value={data.setor} />
        <InfoItem label="Dispositivo" value={data.dispositivo} />
        <InfoItem label="Modelo" value={data.modelo} />
        <InfoItem label="Posse" value={data.posse} />
      </Card>

      <Card title="Status">
        <InfoItem label="Estado" value={data.status} />

      </Card>
    </div>
  );
}

function HardwareTab({ data }) {
  return (
    <div className="cards-grid">
      <Card title="Especificações Técnicas" span>
        <InfoItem
          label="Sistema Operacional"
          value={data.sistema_operacional}
        />
        <InfoItem label="Processador" value={data.processador} />
        <InfoItem label="Memória" value={data.memoria} />
        <InfoItem label="Nº de Série" value={data.numero_serie} />
        <InfoItem label="MAC" value={data.mac} />
      </Card>
    </div>
  );
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
