import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Skeleton } from "../components/Skeleton";
import Dropdown from "../components/ui/Dropdown";
import PageHeader from "./ui/PageHeader";

const ROLES = ["user", "editor", "admin", "superadmin"];

function getInitials(nome = "") {
  const partes = nome.trim().split(" ").filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatRelativeLogin(dateString) {
  if (!dateString) return "Nunca";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
}

const STATUS_LABELS = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
};

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
        .select("id,nome,role,created_at,status,last_sign_in_at")
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <PageHeader title="Usuários" />
        </div>

        <div className="card">
          <Skeleton width="260px" height="1.6rem" className="skeleton-title" />

          <div className="table-wrapper">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>
                    <Skeleton width="80px" height="1rem" />
                  </th>
                  <th>
                    <Skeleton width="80px" height="1rem" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <Skeleton width="140px" height="1.2rem" />
                    </td>
                    <td>
                      <Skeleton width="120px" height="1.8rem" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          <PageHeader title="Usuários" />
        </div>
        <p className="error">{error}</p>
      </div>
    );
  }

  const isSuperAdmin = currentProfile?.role === "superadmin";

  return (
    <div className="home-container home-container--start">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <PageHeader title="Usuários" />
      </div>

      {isSuperAdmin ? (
        <div className="card card--users">
          <h2>Gerenciar funções dos usuários</h2>

          <div className="table-wrapper">
            <table className="equipment-table users-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Função</th>
                  <th>Status</th>
                  <th>Último login</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-avatar" aria-hidden="true">
                            {getInitials(u.nome)}
                          </span>
                          <span className="user-name">{u.nome}</span>
                        </div>
                      </td>
                      <td>
                        <div className="user-role-cell">
                          <Dropdown
                            name={`role-${u.id}`}
                            value={u.role}
                            onChange={(e) => alterarRole(u.id, e.target.value)}
                            options={ROLES}
                            disabled={saving === u.id}
                            placeholder="Selecione..."
                          />
                          {saving === u.id && (
                            <span className="saving-hint">salvando...</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-badge--${u.status}`}
                        >
                          {STATUS_LABELS[u.status] || u.status}
                        </span>
                      </td>
                      <td className="user-login-cell">
                        {formatRelativeLogin(u.last_sign_in_at)}
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
