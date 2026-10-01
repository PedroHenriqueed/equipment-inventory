import {
  Printer,
  Wifi,
  WifiOff,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  online: { label: "Online", color: "#34d399", icon: Wifi },
  offline: { label: "Offline", color: "#f87171", icon: WifiOff },
  alerta: { label: "Com alerta", color: "#fbbf24", icon: AlertTriangle },
  desconhecido: { label: "Desconhecido", color: "#9ca3af", icon: HelpCircle },
};

// Marcas que não expõem nível de toner via SNMP padrão
const SEM_SUPORTE_TONER = ["epson","brother"];

function isSemSuporteToner(printer) {
  const marca = (printer.marca || "").toLowerCase();
  return SEM_SUPORTE_TONER.some((m) => marca.includes(m));
}

function getTonerColor(nivel) {
  if (nivel == null) return "#4b5563";
  if (nivel < 20) return "#f87171";
  if (nivel < 40) return "#fbbf24";
  return "#34d399";
}

export default function PrinterCard({ printer }) {
  const statusInfo =
    STATUS_CONFIG[printer.status] || STATUS_CONFIG.desconhecido;
  const StatusIcon = statusInfo.icon;
  const toner = printer.nivelToner; // 0-100, null = sem dados
  const semSuporte = isSemSuporteToner(printer);

  return (
    
    <div className="printer-card">
      <div className="printer-card-header">
        <div className="printer-card-icon-wrapper">
          <Printer size={22} />
        </div>
        <div className="printer-card-title-block">
          <h3 className="printer-card-name">{printer.nome}</h3>
          <span className="printer-card-location">
            {printer.setor || "Setor não informado"}
          </span>
        </div>
        <span
          className="printer-status-badge"
          style={{ color: statusInfo.color }}
        >
          <StatusIcon size={13} />
          {statusInfo.label}
        </span>
      </div>

      <div className="printer-card-body">
        <div className="printer-card-row">
          <span className="printer-card-row-label">Endereço IP</span>
          <span className="printer-card-row-value">{printer.ip || "-"}</span>
        </div>
        <div className="printer-card-row">
          <span className="printer-card-row-label">Marca / Modelo</span>
          <span className="printer-card-row-value">
            {printer.marca || "-"} {printer.modelo || ""}
          </span>
        </div>
      </div>

      <div className="printer-toner">
        <div className="printer-toner-label-row">
          <span>Nível do toner</span>
          <span>
            {semSuporte
              ? "Não suportado pelo fabricante"
              : toner == null
                ? "Sem dados"
                : `${toner}%`}
          </span>
        </div>
        <div className="printer-toner-bar-track">
          <div
            className="printer-toner-bar-fill"
            style={{
              width: `${toner ?? 0}%`,
              background: getTonerColor(toner),
              opacity: semSuporte || toner == null ? 0.25 : 1,
            }}
          />
        </div>
        {!semSuporte && toner != null && toner < 20 && (
          <span className="printer-toner-alert">⚠ Nível crítico de toner</span>
        )}
      </div>
    </div>
  );
}
