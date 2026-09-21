import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
} from "lucide-react";

const LABELS_CAMPOS = {
  responsavel: "Responsável",
  setor: "Setor",
  dispositivo: "Dispositivo",
  modelo: "Modelo",
  sistema_operacional: "Sistema Operacional",
  processador: "Processador",
  memoria: "Memória",
  numero_serie: "Nº de Série",
  mac: "MAC",
  posse: "Posse",
  patrimonio_dispositivo: "Patrimônio Dispositivo",
  patrimonio_carregador: "Patrimônio Carregador",
  monitor: "Monitor",
  patrimonio_monitor: "Patrimônio Monitor",
  hub_usb: "Hub USB",
  webcam: "Webcam",
  leitor_biometrico: "Leitor Biométrico",
  patrimonio_leitor_biometrico: "Patrimônio Leitor Biométrico",
  fone: "Fone",
  updated_at: "Atualizado em",
  created_at: "Criado em",
};

function labelCampo(campo) {
  return LABELS_CAMPOS[campo] || campo;
}

const ACOES = {
  INSERT: { label: "Cadastrado", cor: "#22c55e" },
  UPDATE: { label: "Editado", cor: "#eab308" },
  DELETE: { label: "Removido", cor: "#ef4444" },
  TRANSFERENCIA: { label: "Transferência", cor: "#3b82f6" },
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAcao, setFiltroAcao] = useState("TODOS");
  const [expandido, setExpandido] = useState(null);

  async function carregarLogs() {
    setLoading(true);

    // aba de transferências busca em outra tabela
    if (filtroAcao === "TRANSFERENCIA") {
      const { data, error } = await supabase
        .from("equipamentos_transferencias")
        .select(
          `
          id,
          transferido_em,
          responsavel_anterior,
          responsavel_novo,
          transferido_por,
          equipamentos ( dispositivo, modelo, patrimonio_dispositivo )
        `,
        )
        .order("transferido_em", { ascending: false })
        .limit(200);

      if (error) console.error(error);
      setLogs(data || []);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("equipamentos_log")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(200);

    if (filtroAcao !== "TODOS") {
      query = query.eq("acao", filtroAcao);
    }

    const { data, error } = await query;
    if (error) console.error(error);
    setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarLogs();
  }, [filtroAcao]);

  function nomeEquipamento(log) {
    const dados = log.dados_novos || log.dados_anteriores;
    return dados?.nome || dados?.modelo || log.equipamento_id;
  }

  function diffCampos(antes, depois) {
    if (!antes || !depois) return [];
    const camposIgnorados = ["updated_at", "created_at"];
    const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)]);
    const diffs = [];
    chaves.forEach((chave) => {
      if (camposIgnorados.includes(chave)) return;
      if (JSON.stringify(antes[chave]) !== JSON.stringify(depois[chave])) {
        diffs.push({
          campo: chave,
          antes: formatarValor(antes[chave]),
          depois: formatarValor(depois[chave]),
        });
      }
    });
    return diffs;
  }

  function formatarValor(valor) {
    if (valor == null || valor === "") return "—";
    if (typeof valor === "boolean") return valor ? "Sim" : "Não";
    if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}T/.test(valor)) {
      return new Date(valor).toLocaleString("pt-BR");
    }
    return String(valor);
  }

  return (
    <div className="auditoria-page">
      <div className="auditoria-header">
        <h1>Histórico de Alterações</h1>
        <button onClick={carregarLogs} className="btn-refresh" type="button">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      <div className="auditoria-filtros">
        {["TODOS", "INSERT", "UPDATE", "DELETE", "TRANSFERENCIA"].map(
          (acao) => (
            <button
              key={acao}
              className={`filtro-btn ${filtroAcao === acao ? "ativo" : ""}`}
              onClick={() => setFiltroAcao(acao)}
              type="button"
            >
              {acao === "TODOS" ? "Todos" : ACOES[acao].label}
            </button>
          ),
        )}
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : logs.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : filtroAcao === "TRANSFERENCIA" ? (
        // ---- LISTA DE TRANSFERÊNCIAS ----
        <div className="auditoria-lista">
          {logs.map((t) => (
            <div key={t.id} className="auditoria-item">
              <div
                className="auditoria-item-header"
                style={{ cursor: "default" }}
              >
                <span
                  className="badge-acao"
                  style={{
                    background: ACOES.TRANSFERENCIA.cor + "20",
                    color: ACOES.TRANSFERENCIA.cor,
                  }}
                >
                  <ArrowRightLeft size={12} style={{ marginRight: 4 }} />
                  {ACOES.TRANSFERENCIA.label}
                </span>

                <span className="auditoria-equip-nome">
                  {t.equipamentos?.dispositivo} — {t.equipamentos?.modelo}
                  {t.equipamentos?.patrimonio_dispositivo &&
                    ` (${t.equipamentos.patrimonio_dispositivo})`}
                </span>

                <span className="auditoria-usuario">
                  {t.responsavel_anterior || "—"} → {t.responsavel_novo}
                </span>

                <span className="auditoria-data">
                  {new Date(t.transferido_em).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ---- LISTA DE LOGS PADRÃO (INSERT/UPDATE/DELETE) ----
        <div className="auditoria-lista">
          {logs.map((log) => {
            const aberto = expandido === log.id;
            const diffs =
              log.acao === "UPDATE"
                ? diffCampos(log.dados_anteriores, log.dados_novos)
                : [];

            return (
              <div key={log.id} className="auditoria-item">
                <div
                  className="auditoria-item-header"
                  onClick={() => setExpandido(aberto ? null : log.id)}
                >
                  <span
                    className="badge-acao"
                    style={{
                      background: ACOES[log.acao]?.cor + "20",
                      color: ACOES[log.acao]?.cor,
                    }}
                  >
                    {ACOES[log.acao]?.label}
                  </span>

                  <span className="auditoria-equip-nome">
                    {nomeEquipamento(log)}
                  </span>

                  <span className="auditoria-usuario">
                    {log.usuario_email || "usuário desconhecido"}
                  </span>

                  <span className="auditoria-data">
                    {new Date(log.criado_em).toLocaleString("pt-BR")}
                  </span>

                  {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {aberto && (
                  <div className="auditoria-detalhes">
                    {log.acao === "INSERT" && (
                      <pre>{JSON.stringify(log.dados_novos, null, 2)}</pre>
                    )}

                    {log.acao === "DELETE" && (
                      <pre>{JSON.stringify(log.dados_anteriores, null, 2)}</pre>
                    )}

                    {log.acao === "UPDATE" && (
                      <table className="tabela-diff">
                        <thead>
                          <tr>
                            <th>Campo</th>
                            <th>Antes</th>
                            <th>Depois</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diffs.length === 0 ? (
                            <tr>
                              <td colSpan={3}>Nenhuma diferença detectada.</td>
                            </tr>
                          ) : (
                            diffs.map((d) => (
                              <tr key={d.campo}>
                                <td>{labelCampo(d.campo)}</td>
                                <td className="valor-antes">{d.antes}</td>
                                <td className="valor-depois">{d.depois}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
