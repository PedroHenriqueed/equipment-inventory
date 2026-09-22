import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar";
import { AlertProvider } from "./components/ui/AlertProvider";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import CadastrarEquipamento from "./components/CadastrarEquipamento";
import VisualizarEquipamentos from "./components/VisualizarEquipamentos";
import EquipmentViewModal from "./components/EquipmentViewModal";
import ConfirmDeleteModal from "./components/ui/ConfirmDeleteModal";
import Configuracoes from "./components/Configuracoes";
import AuditoriaPage from "./components/AuditoriaPage";
import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useEquipments } from "./hooks/useEquipments";
import EquipmentPageWrapper from "./components/EquipmentPageWrapper";
import "./styles.css";

function AcessoNegado() {
  return (
    <div className="acesso-negado">
      <h2>Acesso restrito</h2>
      <p>Você precisa ser administrador para acessar esta página.</p>
    </div>
  );
}

function AppContent() {
  const { usuario, isAdmin, isSuperAdmin, carregando, logout } = useAuth();
  const [telaAuth, setTelaAuth] = useState(null);
  const [activeTab, setActiveTab] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ===== Modal de visualizar/editar equipamento =====
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ===== Modal de confirmação de exclusão =====
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    target: null,
    isBulk: false,
  });

  const [filters, setFilters] = useState({
    busca: "",
    setor: "",
    responsavel: "",
    dispositivo: "",
    modelo: "",
    sistema_operacional: "",
    processador: "",
    memoria: "",
    posse: "",
    perifericos: [],
  });

  const {
    equipments,
    loading,
    error,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  } = useEquipments();

  if (carregando) {
    return (
      <div className="app-loading-wrapper">
        <p>Carregando...</p>
      </div>
    );
  }

  if (telaAuth === "login" && !usuario) {
    return (
      <Login
        onVoltar={() => setTelaAuth(null)}
        onCriarConta={() => setTelaAuth("cadastro")}
      />
    );
  }

  if (telaAuth === "cadastro" && !usuario) {
    return (
      <Cadastro
        onSucesso={() => setTelaAuth("login")}
        onVoltar={() => setTelaAuth("login")}
      />
    );
  }

  // ===== Handlers do modal de visualizar/editar =====
  const handleView = (eq) => {
    setEquipamentoSelecionado(eq);
    setFieldErrors({});
    setModalAberto(true);
  };

  const handleEdit = (eq) => {
    setEquipamentoSelecionado(eq);
    setFieldErrors({});
    setModalAberto(true);
  };

  const handleCloseModal = () => {
    setModalAberto(false);
    setEquipamentoSelecionado(null);
    setFieldErrors({});
  };

  const handleSalvo = async (data, id) => {
    try {
      if (id) {
        await updateEquipment(id, data);
      } else {
        await addEquipment(data);
      }
      handleCloseModal();
    } catch (err) {
      if (err?.type === "duplicate") {
        setFieldErrors({
          [err.field.field]: `${err.field.label} já cadastrado.`,
        });
      }
      throw err;
    }
  };

  // ===== Handlers do modal de confirmação de exclusão =====
  const handleDelete = (eq) => {
    setConfirmDelete({ open: true, target: eq, isBulk: false });
  };

  const handleBulkDelete = (ids) => {
    setConfirmDelete({ open: true, target: ids, isBulk: true });
  };

  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, target: null, isBulk: false });
  };

  const handleConfirmDelete = async () => {
    const { target, isBulk } = confirmDelete;
    try {
      if (isBulk) {
        for (const id of target) {
          await deleteEquipment(id);
        }
      } else {
        await deleteEquipment(target.id);
      }
    } catch (err) {
      console.error("Erro ao excluir equipamento(s):", err);
      alert("Erro ao excluir equipamento(s).");
    } finally {
      handleCancelDelete();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inicio":
        return (
          <Home
            setActiveTab={setActiveTab}
            equipments={equipments}
            filters={filters}
            isAdmin={isAdmin}
          />
        );
      case "cadastrar":
        if (!isAdmin) return <AcessoNegado />;
        return (
          <CadastrarEquipamento
            onSave={addEquipment}
            onSuccess={() => setActiveTab("visualizar")}
          />
        );
      case "visualizar":
        return (
          <VisualizarEquipamentos
            equipments={equipments}
            loading={loading}
            error={error}
            onView={handleView}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
            onBulkDelete={isAdmin ? handleBulkDelete : undefined}
            filters={filters}
            setFilters={setFilters}
            isAdmin={isAdmin}
          />
        );
      case "configuracoes":
        if (!isAdmin) return <AcessoNegado />;
        return <Configuracoes />;
      case "auditoria":
        if (!isSuperAdmin) return <AcessoNegado />;
        return <AuditoriaPage />;
      default:
        return null;
    }
  };

  // Nome exibido no modal de confirmação
  const nomeParaExcluir = confirmDelete.isBulk
    ? `${confirmDelete.target?.length || 0} equipamento(s)`
    : confirmDelete.target?.responsavel;

  return (
    <AlertProvider>
      <div className="app-container">
        <Toaster position="top-right" />
        <Topbar
          open={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          filters={filters}
          setFilters={setFilters}
          showSearch={activeTab === "inicio"}
          equipments={equipments}
          setActiveTab={setActiveTab}
          usuario={usuario}
          isAdmin={isAdmin}
          onLoginClick={() => setTelaAuth("login")}
          onLogoutClick={logout}
        />
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          open={sidebarOpen}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />

        <main
          className={`main-content ${sidebarOpen ? "expanded" : "collapsed"}`}
        >
          <Routes>
            {/* Rota de detalhes do equipamento (página dedicada) */}
            <Route
              path="/equipamentos/:id"
              element={
                <EquipmentPageWrapper
                  equipments={equipments}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                />
              }
            />
            {/* Todas as outras rotas caem no sistema de abas existente */}
            <Route path="*" element={renderContent()} />
          </Routes>
        </main>

        {modalAberto && (
          <EquipmentViewModal
            equipamento={equipamentoSelecionado}
            onClose={handleCloseModal}
            onSalvo={handleSalvo}
            fieldErrors={fieldErrors}
            isAdmin={isAdmin}
          />
        )}

        <ConfirmDeleteModal
          open={confirmDelete.open}
          itemName={nomeParaExcluir}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </AlertProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
