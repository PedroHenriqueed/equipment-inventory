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
  const temChave = Boolean(chaveLicenca);
  const partesChave = temChave ? chaveLicenca.split("-") : [];

  const chaveExibida = !temChave
    ? "Chave não disponível"
    : partesChave
        .map((parte, i) => (i === partesChave.length - 1 ? parte : "****"))
        .join("  ");

  return (
    <div className="windowslicense-card">
      <div className="windowslicense-card-topbar" />

      <div className="windowslicense-card-body">
        <div className="windowslicense-card-header">
          <div className="windowslicense-card-header-text">
            <span className="windowslicense-card-label">DISPOSITIVO</span>
            <h3 className="windowslicense-card-title">Sistema Operacional</h3>
          </div>

          <div className="windowslicense-card-icon-wrapper">
            <WindowsLogo className="windowslicense-card-icon" />
          </div>
        </div>

        <hr className="windowslicense-card-divider" />

        <p className="windowslicense-card-key">{chaveExibida}</p>

        <hr className="windowslicense-card-divider" />

        <div className="windowslicense-card-row">
          <span className="windowslicense-card-row-label">Edição</span>
          <span className="windowslicense-card-row-value">{edicao || "-"}</span>
        </div>

        <div className="windowslicense-card-row">
          <span className="windowslicense-card-row-label">Instalado em</span>
          <span className="windowslicense-card-row-value">
            {formatarDataBR(instaladoEm)}
          </span>
        </div>

        <div className="windowslicense-card-row">
          <span className="windowslicense-card-row-label">Build</span>
          <span className="windowslicense-card-row-value">{build || "-"}</span>
        </div>

        {ativado !== undefined && (
          <div className="windowslicense-card-row">
            <span className="windowslicense-card-row-label">Ativação</span>
            <span
              className={`windowslicense-card-status-pill ${
                ativado ? "is-ok" : "is-danger"
              }`}
            >
              {ativado ? "Ativado" : "Não ativado"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
