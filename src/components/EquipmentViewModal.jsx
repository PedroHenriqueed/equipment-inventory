import { useState, useEffect } from "react";
import EquipmentForm from "./EquipmentForm";
import { X, Check } from "lucide-react";


export default function EquipmentViewModal({
  equipamento,
  onClose,
  onSalvo,
  fieldErrors = {},
  isAdmin,
}) {
  const isNovo = !equipamento;
  const [isEditing, setIsEditing] = useState(isNovo && isAdmin);
  const [saving, setSaving] = useState(false);
  const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

  function InfoItem({ label, value, raw }) {
    return (
      <div className="info-item">
        <span className="info-label">{label}</span>
        <span className="info-value">{raw ? value : value || "-"}</span>
      </div>
    );
  }

  function StatusBadge({ status }) {
    if (!status) return "-";
    const slug = statusSlug(status);
    return (
      <span className={`status-badge status-${slug}`}>
        <span className="status-dot"></span>
        {status}
      </span>
    );
  }

  function statusSlug(status) {
    return status
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }
  useEffect(() => {
    setIsEditing(!equipamento && isAdmin);
  }, [equipamento, isAdmin]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await onSalvo(data, equipamento?.id); // id undefined = criar novo
      onClose();
    } catch (err) {
      if (err?.type !== "duplicate") {
        alert("Erro ao salvar: " + (err.message || "erro desconhecido"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => setMouseDownOnOverlay(e.target === e.currentTarget)}
      onMouseUp={(e) => {
        if (mouseDownOnOverlay && e.target === e.currentTarget) {
          onClose();
        }
        setMouseDownOnOverlay(false);
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {isNovo
              ? "Novo Equipamento"
              : isEditing
                ? "Editar Equipamento"
                : "Detalhes do Equipamento"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {isEditing && isAdmin ? (
          <div className="modal-body">
            <EquipmentForm
              initialData={equipamento || {}}
              onSave={handleSave}
              onCancel={() => (isNovo ? onClose() : setIsEditing(false))}
              saving={saving}
              externalErrors={fieldErrors}
            />
          </div>
        ) : (
          <>
            <div className="modal-body">
              <section className="modal-section">
                <h3>Informações Gerais</h3>
                <div className="modal-grid">
                  <InfoItem label="Hostname" value={equipamento.hostname} />
                  <InfoItem
                    label="Responsável"
                    value={equipamento.responsavel}
                  />
                  <InfoItem label="Setor" value={equipamento.setor} />
                  <InfoItem
                    label="Dispositivo"
                    value={equipamento.dispositivo}
                  />
                  <InfoItem label="Modelo" value={equipamento.modelo} />
                  <InfoItem label="Posse" value={equipamento.posse} />
                  <InfoItem
                    label="Status"
                    value={<StatusBadge status={equipamento.status} />}
                    raw
                  />
                </div>
              </section>

              <section className="modal-section">
                <h3>Especificações Técnicas</h3>
                <div className="modal-grid">
                  <InfoItem
                    label="Sistema Operacional"
                    value={equipamento.sistema_operacional}
                  />
                  <InfoItem
                    label="Processador"
                    value={equipamento.processador}
                  />
                  <InfoItem label="Memória" value={equipamento.memoria} />
                  <InfoItem
                    label="Nº de Série"
                    value={equipamento.numero_serie}
                  />
                  <InfoItem label="MAC" value={equipamento.mac} />
                </div>
              </section>

              <section className="modal-section">
                <h3>Patrimônios</h3>
                <div className="modal-grid">
                  <InfoItem
                    label="Dispositivo"
                    value={equipamento.patrimonio_dispositivo}
                  />
                  <InfoItem
                    label="Carregador"
                    value={equipamento.patrimonio_carregador}
                  />
                  <InfoItem
                    label="Monitor"
                    value={equipamento.patrimonio_monitor}
                  />
                  <InfoItem
                    label="Leitor Biométrico"
                    value={equipamento.patrimonio_leitor_biometrico}
                  />
                </div>
              </section>

              <section className="modal-section">
                <h3>Acessórios</h3>
                <div className="modal-tags">
                  <Tag label="Monitor" active={equipamento.monitor} />
                  <Tag label="Hub USB" active={equipamento.hub_usb} />
                  <Tag label="Webcam" active={equipamento.webcam} />
                  <Tag
                    label="Leitor Biométrico"
                    active={equipamento.leitor_biometrico}
                  />
                  <Tag label="Fone" active={equipamento.fone} />
                </div>
              </section>
            </div>

            {isAdmin && (
              <div className="modal-footer">
                <button
                  className="btn primary"
                  onClick={() => setIsEditing(true)}
                >
                  Alterar
                </button>
              </div>
            )}
          </>
        )}
      </div>
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

function Tag({ label, active }) {
  return (
    <span className={`modal-tag ${active ? "active" : "inactive"}`}>
      {active ? <Check size={14} /> : <X size={14} />} {label}
    </span>
  );
}
