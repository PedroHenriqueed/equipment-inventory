import React from "react";
import { Home as HomeIcon, Plus, List, User, History } from "lucide-react";

const menuItems = [
  { key: "inicio", label: "Início", icon: <HomeIcon size={20} /> },
  {
    key: "cadastrar",
    label: "Adicionar novo equipamento",
    icon: <Plus size={20} />,
    adminOnly: true,
  },
  {
    key: "visualizar",
    label: "Visualizar equipamentos",
    icon: <List size={20} />,
  },
  {
    key: "configuracoes",
    label: "Usuários e permissões",
    icon: <User size={20} />,
    adminOnly: true,
  },
  {
    key: "auditoria",
    label: "Histórico de alterações",
    icon: <History size={20} />,
    superAdminOnly: true,
  },
];

function Sidebar({ activeTab, setActiveTab, open, isAdmin, isSuperAdmin }) {
  const itemsVisiveis = menuItems.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <aside className={`sidebar ${open ? "expanded" : "collapsed"}`}>
      <nav className="sidebar-nav">
        {itemsVisiveis.map((item) => (
          <button
            key={item.key}
            className={`sidebar-item ${activeTab === item.key ? "active" : ""}`}
            data-label={item.label}
            onClick={() => setActiveTab(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {open && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
