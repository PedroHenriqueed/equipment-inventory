import { useState, useRef, useEffect } from "react";
import { PenLine, Eraser, Eye } from "lucide-react";

export default function ActionMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 150;
      const menuWidth = 160;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.right;

      const openUpward = spaceBelow < menuHeight;
      const openLeft = spaceRight < menuWidth;

      setPosition({
        top: openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4,
        left: openLeft
          ? rect.left - menuWidth + rect.width
          : rect.right - menuWidth,
      });
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="action-menu-trigger"
        onClick={handleToggle}
        aria-label="Abrir menu de ações"
      >
        ⋯
      </button>

      {open && (
        <div
          ref={menuRef}
          className="action-menu-dropdown"
          style={{ position: "fixed", top: position.top, left: position.left }}
        >
          <button
            className="action-menu-item"
            onClick={() => {
              onView();
              setOpen(false);
            }}
          >
            <Eye size={18} /> Visualizar
          </button>

          {onEdit && (
            <button
              className="action-menu-item"
              onClick={() => {
                onEdit(true);
                setOpen(false);
              }}
            >
              <PenLine size={18} /> Alterar
            </button>
          )}

          {onDelete && (
            <button
              className="action-menu-item danger"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
            >
              <Eraser size={18} /> Deletar
            </button>
          )}
        </div>
      )}
    </>
  );
}
