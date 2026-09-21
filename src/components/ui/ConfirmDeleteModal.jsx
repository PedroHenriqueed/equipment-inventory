
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDeleteModal({
  open,
  itemName,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="confirm-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">
            <AlertTriangle size={20} />
          </div>
          <button className="modal-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="confirm-modal-body">
          <h2>Excluir equipamento?</h2>
          <p>
            Você está prestes a excluir{" "}
            {itemName ? <strong>{itemName}</strong> : "este equipamento"}. Essa
            ação não pode ser desfeita.
          </p>
        </div>

        <div className="confirm-modal-footer">
          <button className="btn secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn danger" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
