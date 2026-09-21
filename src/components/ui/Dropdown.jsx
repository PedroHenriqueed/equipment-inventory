import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Dropdown({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  placeholder = "Selecione...",
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // normaliza options: aceita string[] ou { value, label }[]
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  const selectedOption = normalizedOptions.find((o) => o.value === value);

  function handleSelect(optionValue) {
    // simula evento nativo pra manter compatibilidade com handleChange(e)
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  }

  return (
    <div className="dropdown-field">
      {label && <label className="dropdown-label">{label}</label>}

      <div className="dropdown-wrapper" ref={ref}>
        <button
          type="button"
          className={`dropdown-trigger ${disabled ? "disabled" : ""} ${
            error ? "has-error" : ""
          }`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
        >
          <span className={!selectedOption ? "dropdown-placeholder" : ""}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={18}
            className={`dropdown-chevron ${isOpen ? "open" : ""}`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="dropdown-menu">
            {normalizedOptions.length === 0 ? (
              <div className="dropdown-empty">Nenhuma opção disponível</div>
            ) : (
              normalizedOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="dropdown-item"
                  onClick={() => handleSelect(option.value)}
                >
                  <div>
                    <div className="dropdown-item-label">{option.label}</div>
                    {option.description && (
                      <div className="dropdown-item-desc">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {value === option.value && <Check size={16} />}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error && <span className="dropdown-error-msg">{error}</span>}
    </div>
  );
}
