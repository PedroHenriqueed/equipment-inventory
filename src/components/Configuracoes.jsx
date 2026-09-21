import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ROLES = ["user", "editor", "admin", "superadmin"];

function Configuracoes() {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      setError("Não foi possível identificar o usuário logado.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      setError("Não foi possível carregar seu perfil.");
      setLoading(false);
      return;
    }

    setCurrentProfile(profile);

    if (profile.role === "superadmin") {
      const { data, error: usersError } = await supabase
        .from("profiles")
        .select("id,nome,role")
        .order("nome", { ascending: true });

      if (usersError) {
        setError("Erro ao carregar lista de usuários.");
      } else {
        setUsers(data);
      }
    }

    setLoading(false);
  }

  async function alterarRole(userId, novaRole) {
    setSaving(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ role: novaRole })
      .eq("id", userId);

    if (error) {
      alert("Erro ao atualizar a função: " + error.message);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: novaRole } : u)),
      );
    }
    setSaving(null);
  }

  if (loading) {
    return (
      <div className="home-container">
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <p className="error">{error}</p>
      </div>
    );
  }

  const isSuperAdmin = currentProfile?.role === "superadmin";

  return (
    <div className="home-container">


      {isSuperAdmin ? (
        <div className="card">
          <h2>Gerenciar funções dos usuários</h2>

          <div className="table-wrapper">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Função</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="empty-state">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nome}</td>
                      <td>
                        <select
                          className="filter-select"
                          value={u.role}
                          disabled={saving === u.id}
                          onChange={(e) => alterarRole(u.id, e.target.value)}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {saving === u.id && (
                          <span
                            style={{
                              marginLeft: 8,
                              color: "#9ca3af",
                              fontSize: 13,
                            }}
                          >
                            salvando...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="acesso-negado">
          <h2>Acesso restrito</h2>
          <p>Você não tem permissão para gerenciar funções de usuários.</p>
        </div>
      )}
    </div>
  );
}

export default Configuracoes;
