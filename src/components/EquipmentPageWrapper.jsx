import { useParams, useNavigate } from "react-router-dom";
import EquipmentPage from "../components/EquipmentPage";

export default function EquipmentPageWrapper({ equipments, isAdmin, onEdit }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Busca o equipamento pelo id na lista já carregada em memória
  const equipamento = equipments.find((eq) => String(eq.id) === String(id));

  if (!equipamento) {
    return (
      <div className="page-loading">
        <p>Equipamento não encontrado.</p>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <EquipmentPage
      equipamento={equipamento}
      isAdmin={isAdmin}
      onEdit={() => onEdit?.(equipamento)}
    />
  );
}
