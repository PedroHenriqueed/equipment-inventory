import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, X, LogIn } from "lucide-react";
import ProfileModal from "../components/ui/ProfileModal";

// Cores para o avatar, geradas de forma consistente a partir do nome
const AVATAR_COLORS = [
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

function avatarColor(nome) {
  if (!nome) return AVATAR_COLORS[0];
  const code = nome.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

// Destaca a parte do nome que corresponde ao termo pesquisado
function highlightMatch(texto, termo) {
  if (!termo || !texto) return texto;
  const idx = texto.toLowerCase().indexOf(termo.toLowerCase());
  if (idx === -1) return texto;
  return (
    <>
      {texto.slice(0, idx)}
      <strong>{texto.slice(idx, idx + termo.length)}</strong>
      {texto.slice(idx + termo.length)}
    </>
  );
}

function Topbar({
  open,
  setSidebarOpen,
  filters,
  setFilters,
  showSearch,
  equipments = [],
  setActiveTab,
  usuario,
  isAdmin,
  onLoginClick,
  onLogoutClick,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const wrapperRef = useRef(null);
  const resultsRef = useRef(null);

  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState([]);
  const [openResultados, setOpenResultados] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Fecha a lista de resultados ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenResultados(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtra os equipamentos conforme o usuário digita
  useEffect(() => {
    if (!termo.trim()) {
      setResultados([]);
      return;
    }
    const termoLower = termo.toLowerCase();
    const filtrados = (equipments || []).filter((eq) =>
      [eq.responsavel, eq.setor, eq.dispositivo, eq.modelo, eq.patrimonio]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termoLower)),
    );
    setResultados(filtrados.slice(0, 8));
    setOpenResultados(true);
  }, [termo, equipments]);

  // Reseta o índice destacado sempre que os resultados mudarem
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [resultados]);

  // Rola o item destacado para dentro da área visível do painel
  useEffect(() => {
    if (highlightedIndex < 0 || !resultsRef.current) return;
    const container = resultsRef.current;
    const item = container.children[highlightedIndex];
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleChange = (e) => {
    const valor = e.target.value;
    setTermo(valor);
    if (setFilters) {
      setFilters((prev) => ({ ...prev, busca: valor }));
    }
  };

  const handleClear = () => {
    setTermo("");
    setResultados([]);
    setOpenResultados(false);
    setHighlightedIndex(-1);
    if (setFilters) {
      setFilters((prev) => ({ ...prev, busca: "" }));
    }
  };

  const irParaVisualizar = (eq) => {
    if (setFilters) {
      setFilters((prev) => ({ ...prev, busca: eq.responsavel || "" }));
    }
    if (setActiveTab) {
      setActiveTab("visualizar");
    }
    setOpenResultados(false);
    setTermo("");
    setHighlightedIndex(-1);
  };

  // Navega para a listagem completa (link "Ver tudo")
  const verTudo = () => {
    if (setActiveTab) {
      setActiveTab("visualizar");
    }
    setOpenResultados(false);
  };

  // Navegação por teclado no campo de busca
  const handleKeyDown = (e) => {
    if (!openResultados || resultados.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < resultados.length - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : resultados.length - 1,
        );
        break;

      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && resultados[highlightedIndex]) {
          irParaVisualizar(resultados[highlightedIndex]);
        }
        break;

      case "Escape":
        e.preventDefault();
        setOpenResultados(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  const avatarUrl = usuario?.user_metadata?.avatar_url;
  const nomeUsuario =
    usuario?.user_metadata?.full_name || usuario?.email?.split("@")[0] || "";
  const inicial = nomeUsuario.charAt(0).toUpperCase();

  return (
    <header className="app-topbar">
      <button
        className="menu-toggle-btn"
        data-label="Menu principal"
        onClick={() => setSidebarOpen(!open)}
      >
        <Menu size={20} />
      </button>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="175 175 140 150"
        className="brand-logo"
        fill="#f2f2f2"
      >
        <circle cx="201.21" cy="212.54" r="15.16" />
        <path d="M294.04,192.38h-9.16l-14.75,44.38-14.75-44.38h-30.48l26.57,68.3c4.02,10.33-3.6,21.48-14.69,21.48h-12.07l4.21,25.46h14.46c18.06,0,34.14-11.4,40.12-28.44l30.45-86.8h-19.91Z" />
      </svg>

      <span className="brand-title">Inventário</span>

      {showSearch && (
        <div className="search-input-wrapper topbar-search" ref={wrapperRef}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar equipamento, responsável, setor..."
            value={termo}
            onChange={handleChange}
            onFocus={() => termo && setOpenResultados(true)}
            onKeyDown={handleKeyDown}
            className="filter-input filter-input-icon"
            role="combobox"
            aria-expanded={openResultados}
            aria-controls="search-results-listbox"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `search-result-${highlightedIndex}`
                : undefined
            }
            aria-autocomplete="list"
          />
          {termo && (
            <button
              type="button"
              className="chip-remove search-clear-btn"
              onClick={handleClear}
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}

          {openResultados && resultados.length > 0 && (
            <div
              className="search-results-panel"
              id="search-results-listbox"
              role="listbox"
              ref={resultsRef}
            >
              <div className="search-results-header">
                <span>EQUIPAMENTOS</span>
                <button
                  type="button"
                  className="search-results-vertudo"
                  onClick={verTudo}
                >
                  Ver tudo
                </button>
              </div>

              {resultados.map((eq, index) => {
                const nome = eq.responsavel || "Sem responsável";
                const inicialItem = nome.charAt(0).toUpperCase();
                return (
                  <button
                    key={eq.id}
                    id={`search-result-${index}`}
                    type="button"
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className={`search-result-item ${
                      index === highlightedIndex ? "highlighted" : ""
                    }`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => irParaVisualizar(eq)}
                  >
                    <span
                      className="search-result-avatar"
                      style={{ background: avatarColor(nome) }}
                    >
                      {inicialItem}
                    </span>
                    <span className="search-result-texts">
                      <span className="search-result-name">
                        {highlightMatch(nome, termo)}
                      </span>
                      <span className="search-result-sub">
                        {eq.dispositivo}
                        {eq.modelo ? ` · ${eq.modelo}` : ""}
                        {eq.setor ? ` · ${eq.setor}` : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {openResultados && termo && resultados.length === 0 && (
            <div className="search-results-panel">
              <span className="search-no-results">
                Nenhum resultado encontrado.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ===== Área de login/usuário (canto superior direito) ===== */}
      <div className="topbar-auth">
        {usuario ? (
          <button
            className="topbar-avatar-btn"
            onClick={() => setPerfilAberto(true)}
            aria-label="Abrir perfil"
            type="button"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nomeUsuario}
                className="topbar-avatar-img"
              />
            ) : (
              <span className="topbar-avatar-fallback">{inicial}</span>
            )}
          </button>
        ) : (
          <button
            className="btn-login"
            onClick={onLoginClick}
            aria-label="Entrar"
            type="button"
          >
            <LogIn size={18} />
            <span>Entrar</span>
          </button>
        )}
      </div>

      {perfilAberto && (
        <ProfileModal
          usuario={usuario}
          isAdmin={isAdmin}
          onClose={() => setPerfilAberto(false)}
          onLogout={() => {
            setPerfilAberto(false);
            onLogoutClick();
          }}
        />
      )}
    </header>
  );
}

export default Topbar;
