import { useEffect, useRef, useState } from "react";
import { equipamentosService } from "../services/equipamentosService";
import EquipmentViewModal from "./EquipmentViewModal";
import ConfirmDeleteModal from "../components/ui/ConfirmDeleteModal";
import { StatCard } from "./ui/StatCard";
import { RankingDonutCard } from "./ui/RankingDonutCard";
import { Plus, Trash2, MoreVertical, User, Building2, Eraser } from "lucide-react";

export default function Home({ setActiveTab, isAdmin }) {
  const [ultimos, setUltimos] = useState([]);
  const [carregandoUltimos, setCarregandoUltimos] = useState(true);
  const [erroUltimos, setErroUltimos] = useState(null);
  const [emManutencao, setEmManutencao] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [rankingSetores, setRankingSetores] = useState([]);
  const [rankingQuebras, setRankingQuebras] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoEditando, setEquipamentoEditando] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    equip: null,
  });

  async function carregarDados() {
    setCarregandoUltimos(true);
    setErroUltimos(null);
    try {
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
    } catch (err) {
      setErroUltimos("Não foi possível carregar os últimos equipamentos.");
    } finally {
      setCarregandoUltimos(false);
    }
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
          <Card titulo="Ações Rápidas" variante="acoes-rapidas">
            <div className="quick-actions-panel">
              <button
                type="button"
                className="quick-action quick-action-primary"
                onClick={irParaCadastrar}
              >
                <span className="quick-action-icon" aria-hidden="true">
                  <Plus size={18} strokeWidth={2.5} />
                </span>
                <span className="quick-action-text">
                  <strong>Adicionar equipamento</strong>
                  <span>Cadastrar uma nova máquina no inventário</span>
                </span>
              </button>

              <button
                type="button"
                className="quick-action quick-action-secondary"
                onClick={irParaVisualizar}
              >
                <span className="quick-action-icon" aria-hidden="true">
                  <Trash2 size={16} strokeWidth={2} />
                </span>
                <span className="quick-action-text">
                  <span className="quick-action-secondary-title">
                    Excluir equipamento
                  </span>
                  <span className="quick-action-secondary-desc">
                    Selecionar e confirmar remoção
                  </span>
                </span>
              </button>
            </div>
          </Card>
        )}

        <Card
          titulo="Últimos Adicionados"
          variante="ultimos-adicionados"
          acao={
            <button
              type="button"
              className="ver-todos-btn"
              onClick={irParaVisualizar}
            >
              Ver todos
            </button>
          }
        >
          <UltimosAdicionadosLista
            itens={ultimos}
            carregando={carregandoUltimos}
            erro={erroUltimos}
            isAdmin={isAdmin}
            onExcluir={pedirExclusao}
          />
        </Card>

        <div className="stat-tile stat-tile--manutencao">
          <StatCard
            title="Em Manutenção"
            value={emManutencao.length}
            color="blue"
            decor="rects"
          />
        </div>

        <div className="stat-tile stat-tile--disponiveis">
          <StatCard
            title="Máquinas Disponíveis"
            value={disponiveis.length}
            color="blue"
            decor="circles"
          />
        </div>

        <RankingDonutCard
          titulo="Máquinas por Setor"
          dados={rankingSetores}
          campoLabel="setor"
          campoValor="total_maquinas"
        />

        <RankingDonutCard
          titulo="Setores com Mais Manutenção"
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

function Card({ titulo, acao,variante,children }) {
  return (
    <div className={`card${variante ? ` card--${variante}` : ""}`}>
      <div className="card-header-row">
        <h2>{titulo}</h2>
        {acao}
      </div>
      <div className="card-content">{children}</div>
    </div>
  );
}

function UltimosAdicionadosLista({
  itens,
  carregando,
  erro,
  isAdmin,
  onExcluir,
}) {
  if (carregando) {
    return (
      <div className="skeleton-list" aria-live="polite" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-row">
            <div
              className="skeleton skeleton-card"
              style={{ width: "100%", height: 48 }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (erro) {
    return (
      <p className="empty-state" role="alert">
        {erro}
      </p>
    );
  }

  if (!itens || itens.length === 0) {
    return (
      <p className="empty-state">Nenhum equipamento cadastrado recentemente.</p>
    );
  }

  const exibidos = itens.slice(0, 5);

  return (
    <ul className="ultimos-lista">
      {exibidos.map((equip) => (
        <UltimoItem
          key={equip.id}
          equip={equip}
          isAdmin={isAdmin}
          onExcluir={onExcluir}
        />
      ))}
    </ul>
  );
}

function UltimoItem({ equip, isAdmin, onExcluir }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuAberto) return;

    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setMenuAberto(false);
    }

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuAberto]);

  return (
    <li className="ultimo-item">
      <div className="ultimo-item-main">
        <span className="ultimo-item-modelo">{equip.modelo}</span>
        <div className="ultimo-item-meta">
          <span className="ultimo-item-meta-item">
            <User size={12} aria-hidden="true" />
            {equip.responsavel}
          </span>
          <span className="ultimo-item-meta-item">
            <Building2 size={12} aria-hidden="true" />
            {equip.setor || "Sem setor"}
          </span>
        </div>
      </div>

      {isAdmin && (
        <div className="action-menu" ref={menuRef}>
          <button
            type="button"
            className="action-menu-trigger"
            aria-haspopup="true"
            aria-expanded={menuAberto}
            aria-label={`Mais ações para ${equip.modelo}`}
            onClick={() => setMenuAberto((v) => !v)}
          >
            <MoreVertical size={16} />
          </button>

          {menuAberto && (
            <div className="action-menu-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="action-menu-item danger"
                onClick={() => {
                  setMenuAberto(false);
                  onExcluir(equip);
                }}
              >
                <Eraser size={18} aria-hidden="true" />
                Deletar
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
