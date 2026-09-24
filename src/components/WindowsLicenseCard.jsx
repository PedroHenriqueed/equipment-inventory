import { useState } from "react";
import { Eye, EyeOff, Copy, Check, Grid2x2 } from "lucide-react";

function formatarDataBR(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("-");
  if (!ano || !mes || !dia) return dataISO; // fallback se vier em outro formato
  return `${dia}/${mes}/${ano}`;
}
function WindowsLogo({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 88 88" className={className} fill="currentColor">
      <path d="M0 12.4l35.7-4.9v34.3H0V12.4zM39.8 6.8L87.9 0v41.8H39.8V6.8zM0 45.8h35.7v34.4L0 75.3V45.8zM39.8 45.8h48.1V88l-48-6.7V45.8z" />
    </svg>
  );
}

export default function WindowsLicenseCard({
  edicao,
  instaladoEm,
  build,
  serial,
  chaveLicenca,
  ativado,
}) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const temChave = Boolean(chaveLicenca);
  const partesChave = temChave ? chaveLicenca.split("-") : [];

  const chaveExibida = !temChave
    ? "Chave não disponível"
    : showKey
      ? partesChave.join("  ")
      : partesChave
          .map((parte, i) => (i === partesChave.length - 1 ? parte : "****"))
          .join("  ");

  const handleCopy = () => {
    if (!temChave) return;
    navigator.clipboard.writeText(chaveLicenca);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1E40AF;] p-5 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WindowsLogo className="w-5 h-5 text-white/90" />
          <span className="font-semibold">Microsoft Windows</span>
        </div>

        <div className="flex items-center gap-2">
          {ativado !== undefined && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                ativado
                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {ativado ? "Ativado" : "Não ativado"}
            </span>
          )}

          <button
            onClick={handleCopy}
            disabled={!temChave}
            title="Copiar chave"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied ? (
              <Check size={16} className="text-white/90" />
            ) : (
              <Copy size={16} className="text-white/90" />
            )}
          </button>

          <button
            onClick={() => setShowKey((prev) => !prev)}
            disabled={!temChave}
            title={showKey ? "Ocultar chave" : "Mostrar chave"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {showKey ? (
              <EyeOff size={16} className="text-white/90" />
            ) : (
              <Eye size={16} className="text-white/90" />
            )}
          </button>
        </div>
      </div>

      {/* Chave da licença */}
      <p className="mt-4 font-mono text-lg tracking-[0.2em] text-white/90 select-all">
        {chaveExibida}
      </p>

      <div className="my-4 h-px bg-white/10" />

      {/* Informações principais */}
      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <div>
          <p className="text-white/60">Edição</p>
          <p className="font-medium text-white">{edicao || "-"}</p>
        </div>
        <div>
          <p className="text-white/60">Instalado em</p>
          <p className="font-medium text-white">
            {formatarDataBR(instaladoEm)}
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-white/10" />

      <div className="grid grid-cols-2 gap-y-3 text-sm">
        <div>
          <p className="text-white/60">Build</p>
          <p className="font-medium text-white">{build || "-"}</p>
        </div>
      </div>
    </div>
  );
}
