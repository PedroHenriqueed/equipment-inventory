import { useState } from "react";
import { RefreshCw, Plus, X } from "lucide-react";
import { useProvedoras } from "../services/useProvedoras";
import ProvedoraCard from "./ui/ProvedoraCard";
import PageHeader from "./ui/PageHeader";

function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: 10,
          padding: 24,
          width: 360,
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          marginBottom: 4,
          color: "#ccc",
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #333",
          background: "#0f0f0f",
          color: "#fff",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

export default function InternetPage({ isAdmin }) {
  const {
    provedoras,
    loading: loadingProvedoras,
    error: errorProvedoras,
    refetch: refetchProvedoras,
    addProvedora,
  } = useProvedoras();

  const [showProvedoraModal, setShowProvedoraModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [novaProvedora, setNovaProvedora] = useState({ nome: "", ipTeste: "" });

  const handleRefreshAll = () => {
    refetchProvedoras();
  };

  const handleSubmitProvedora = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!novaProvedora.nome.trim() || !novaProvedora.ipTeste.trim()) {
      setFormError("Preencha nome e IP de teste.");
      return;
    }
    setSaving(true);
    try {
      await addProvedora(novaProvedora);
      setNovaProvedora({ nome: "", ipTeste: "" });
      setShowProvedoraModal(false);
    } catch (err) {
      setFormError(err.message || "Erro ao salvar provedora.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="home-container">
      {/* Cabeçalho Padronizado */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <PageHeader title="Internet" />
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn secondary"
            onClick={handleRefreshAll}
            title="Atualizar status"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ===== Seção: Provedoras ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "24px 0 12px",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>
          Provedoras de Internet
        </h2>
        {isAdmin && (
          <button
            className="btn secondary"
            onClick={() => {
              setFormError(null);
              setShowProvedoraModal(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={16} /> Nova provedora
          </button>
        )}
      </div>

      {loadingProvedoras && (
        <div className="printers-grid">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="printer-card skeleton"
              style={{ height: 190 }}
            />
          ))}
        </div>
      )}

      {!loadingProvedoras && errorProvedoras && (
        <p className="empty-state">
          Não foi possível carregar as provedoras. {errorProvedoras}
        </p>
      )}

      {!loadingProvedoras && !errorProvedoras && provedoras.length === 0 && (
        <p className="empty-state">Nenhuma provedora cadastrada.</p>
      )}

      {!loadingProvedoras && !errorProvedoras && provedoras.length > 0 && (
        <div className="printers-grid">
          {provedoras.map((p) => (
            <ProvedoraCard key={p.id} provedora={p} />
          ))}
        </div>
      )}

      {/* ===== Modal: Nova Provedora ===== */}
      {showProvedoraModal && (
        <Modal
          title="Nova provedora"
          onClose={() => setShowProvedoraModal(false)}
        >
          <form onSubmit={handleSubmitProvedora}>
            <Field
              label="Nome"
              value={novaProvedora.nome}
              onChange={(e) =>
                setNovaProvedora({ ...novaProvedora, nome: e.target.value })
              }
              placeholder="Ex: Vivo Fibra"
            />
            <Field
              label="IP de teste"
              value={novaProvedora.ipTeste}
              onChange={(e) =>
                setNovaProvedora({ ...novaProvedora, ipTeste: e.target.value })
              }
              placeholder="Ex: 8.8.8.8"
            />
            {formError && (
              <p style={{ color: "#f87171", fontSize: 13 }}>{formError}</p>
            )}
            <button
              type="submit"
              className="btn primary"
              disabled={saving}
              style={{ width: "100%", marginTop: 8 }}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
