import { useState } from "react";
import { X } from "lucide-react";

export default function PrinterFormModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    nome: "",
    ip: "",
    marca: "",
    modelo: "",
    setor: "",
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.ip) {
      setErro("Nome e IP são obrigatórios.");
      return;
    }
    setSaving(true);
    setErro("");
    try {
      await onSave(form);
    } catch {
      setErro("Erro ao salvar impressora.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2>Nova impressora</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <p className="error">{erro}</p>}
            <div className="form-grid">
              <div className="field">
                <label>Nome *</label>
                <input name="nome" value={form.nome} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Endereço IP *</label>
                <input
                  name="ip"
                  value={form.ip}
                  onChange={handleChange}
                  placeholder="192.168.0.10"
                />
              </div>
              <div className="field">
                <label>Marca</label>
                <input
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Modelo</label>
                <input
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                />
              </div>
              <div className="field field-full">
                <label>Setor</label>
                <input
                  name="setor"
                  value={form.setor}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>
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
