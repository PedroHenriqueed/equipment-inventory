import { useEffect, useState } from "react";
import { equipamentosService } from "../services/equipamentosService";
import EquipmentViewModal from "./EquipmentViewModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { StatCard } from "./ui/StatCard";
import { RankingDonutCard } from "./ui/RankingDonutCard";

export default function Home({ setActiveTab, isAdmin }) {
  const [ultimos, setUltimos] = useState([]);
  const [emManutencao, setEmManutencao] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [rankingSetores, setRankingSetores] = useState([]);
  const [rankingQuebras, setRankingQuebras] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoEditando, setEquipamentoEditando] = useState(null);

  // ===== Estado do modal de confirmação de exclusão =====
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    equip: null,
  });

  async function carregarDados() {
    const [u, m, d, rs, rq] = await Promise.all([
      equipamentosService.getUltimosAdicionados(),
      equipamentosService.getEmManutencao(),
      equipamentosService.getDisponiveis(),
      equipamentosService.getRankingPorSetor(),
      equipamentosService.getRankingQuebrasPorSetor(),
    ]);
    setUltimos(u);
    setEmManutencao(m);
    setDisponiveis(d);
    setRankingSetores(rs);
    setRankingQuebras(rq);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function pedirExclusao(equip) {
    setConfirmDelete({ open: true, equip });
  }

  function cancelarExclusao() {
    setConfirmDelete({ open: false, equip: null });
  }

  async function confirmarExclusao() {
    const { equip } = confirmDelete;
    if (!equip) return;
    try {
      await equipamentosService.excluir(equip.id);
      carregarDados();
    } finally {
      cancelarExclusao();
    }
  }

  function abrirModalEditar(equip) {
    setEquipamentoEditando(equip);
    setModalAberto(true);
  }

  function irParaVisualizar() {
    if (setActiveTab) setActiveTab("visualizar");
  }
  function irParaCadastrar() {
    if (setActiveTab) setActiveTab("cadastrar");
  }

  return (
    <div className="home-container">
      <div className="grid-cards">
        {isAdmin && (
          <Card titulo="Ações Rápidas">
            <div className="acoes-rapidas">
              <button className="acao-btn acao-add" onClick={irParaCadastrar}>
                <span className="acao-icon">+</span>
                Adicionar Equipamento
              </button>
              <button className="acao-btn acao-edit" onClick={irParaVisualizar}>
                <span className="acao-icon">✎</span>
                Editar Equipamento
              </button>
              <button
                className="acao-btn acao-delete"
                onClick={irParaVisualizar}
              >
                <span className="acao-icon">🗑</span>
                Excluir Equipamento
              </button>
            </div>
          </Card>
        )}

        <Card titulo="Últimos Adicionados">
          {ultimos.map((e) => (
            <EquipamentoLinha
              key={e.id}
              equip={e}
              isAdmin={isAdmin}
              onEditar={abrirModalEditar}
              onExcluir={pedirExclusao}
            />
          ))}
        </Card>

        <StatCard
          title="Em Manutenção"
          value={emManutencao.length}
          color="blue"
          decor="rects"
        />

        <StatCard
          title="Máquinas Disponíveis"
          value={disponiveis.length}
          color="blue"
          decor="circles"
        />

        <RankingDonutCard
          titulo="Máquinas por Setor"
          dados={rankingSetores}
          campoLabel="setor"
          campoValor="total_maquinas"
        />

        <RankingDonutCard
          titulo="Setores que Mais Quebram"
          dados={rankingQuebras}
          campoLabel="setor"
          campoValor="total_quebras"
        />
      </div>

      {modalAberto && (
        <EquipmentViewModal
          equipamento={equipamentoEditando}
          isAdmin={isAdmin}
          onClose={() => setModalAberto(false)}
          onSalvo={async (data, id) => {
            if (id) {
              await equipamentosService.atualizar(id, data);
            } else {
              await equipamentosService.criar(data);
            }
            setModalAberto(false);
            carregarDados();
          }}
        />
      )}

      <ConfirmDeleteModal
        open={confirmDelete.open}
        itemName={confirmDelete.equip?.responsavel}
        onConfirm={confirmarExclusao}
        onCancel={cancelarExclusao}
      />
    </div>
  );
}

function Card({ titulo, children }) {
  return (
    <div className="card">
      <h2>{titulo}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
}

function EquipamentoLinha({ equip, isAdmin, onEditar, onExcluir }) {
  return (
    <div className="equip-linha">
      <span>
        <strong>{equip.modelo}</strong> -- {equip.processador} --{" "}
        {equip.responsavel} ({equip.setor || "sem setor"})
      </span>
      {isAdmin && (
        <div className="equip-linha-acoes">
          <button onClick={() => onEditar(equip)} aria-label="Editar">
            ✎
          </button>
          <button onClick={() => onExcluir(equip)} aria-label="Excluir">
            🗑
          </button>
        </div>
      )}
    </div>
  );
}
