// ProvedoraCard.jsx
import { Signal, SignalZero, SignalLow, CheckCircle2 } from "lucide-react";

const STATUS_CONFIG = {
  online: { label: "Online", color: "#34d399", icon: Signal },
  instavel: { label: "Sinal fraco", color: "#fbbf24", icon: SignalLow },
  offline: { label: "Offline", color: "#f87171", icon: SignalZero },
  desconhecido: { label: "Desconhecido", color: "#9ca3af", icon: SignalZero },
};

export default function ProvedoraCard({ provedora }) {
  const info = STATUS_CONFIG[provedora.status] || STATUS_CONFIG.desconhecido;
  const Icon = info.icon;

  const tudoOk = provedora.status === "online" && provedora.perdaPacotes === 0;

  return (
    <div className="printer-card">
      <div className="printer-card-header">
        <div className="printer-card-icon-wrapper">
          <Icon size={22} />
        </div>
        <div className="printer-card-title-block">
          <h3 className="printer-card-name">{provedora.nome}</h3>
          <span className="printer-card-location">{provedora.ipTeste}</span>
        </div>
        <span className="printer-status-badge" style={{ color: info.color }}>
          <Icon size={13} />
          {info.label}
        </span>
      </div>

      <div className="printer-card-body">
        <div className="printer-card-row">
          <span className="printer-card-row-label">Latência</span>
          <span className="printer-card-row-value">
            {provedora.latenciaMs != null ? `${provedora.latenciaMs} ms` : "-"}
          </span>
        </div>
        <div className="printer-card-row">
          <span className="printer-card-row-label">Perda de pacotes</span>
          <span className="printer-card-row-value">
            {provedora.perdaPacotes != null
              ? `${provedora.perdaPacotes}%`
              : "-"}
          </span>
        </div>

        {tudoOk && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              padding: "6px 10px",
              borderRadius: 6,
              background: "rgba(52, 211, 153, 0.12)",
              color: "#34d399",
              fontSize: 13,
              fontWeight: 500,
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={15} />
            Conexão estável

          </div>
        )}
      </div>
    </div>
  );
}
