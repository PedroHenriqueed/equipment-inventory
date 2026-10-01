import { useState, useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { usePrinters } from "../services/usePrinters";
import PrinterCard from "./ui/PrinterCard";
import PrinterFormModal from "./PrinterFormModal";
import PageHeader from "./ui/PageHeader";

const ORDEM_STATUS = {
  online: 0,
  alerta: 1,
  desconhecido: 2,
  offline: 3,
};

export default function PrintersPage({ isAdmin }) {
  const { printers, loading, error, refetch, addPrinter } = usePrinters();
  const [modalOpen, setModalOpen] = useState(false);

  const printersOrdenadas = useMemo(() => {
    return [...printers].sort((a, b) => {
      const prioridadeA = ORDEM_STATUS[a.status] ?? 99;
      const prioridadeB = ORDEM_STATUS[b.status] ?? 99;
      return prioridadeA - prioridadeB;
    });
  }, [printers]);

  return (
    <div className="home-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <PageHeader title="Impressoras" />
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn secondary"
            onClick={refetch}
            title="Atualizar status"
          >
            <RefreshCw size={16} />
          </button>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Nova impressora
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="printers-grid">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="printer-card skeleton"
              style={{ height: 190 }}
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="empty-state">
          Não foi possível carregar as impressoras. {error}
        </p>
      )}

      {!loading && !error && printers.length === 0 && (
        <p className="empty-state">Nenhuma impressora cadastrada.</p>
      )}

      {!loading && !error && printers.length > 0 && (
        <div className="printers-grid">
          {printersOrdenadas.map((p) => (
            <PrinterCard key={p.id} printer={p} />
          ))}
        </div>
      )}

      {modalOpen && (
        <PrinterFormModal
          onClose={() => setModalOpen(false)}
          onSave={async (data) => {
            await addPrinter(data);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
