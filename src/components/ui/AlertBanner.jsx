import { CheckCircle2, AlertCircle, XCircle, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle2 />,
  destructive: <XCircle />,
  warning: <AlertCircle />,
  default: <CheckCircle2 />,
};

export default function AlertBanner({
  variant = "default",
  title,
  description,
  onDismiss,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div
      className={`alert-banner alert-banner-${variant}`}
      role="alert"
      aria-live="assertive"
    >
      <button
        onClick={onDismiss}
        aria-label="Fechar aviso"
        className="alert-banner-close"
      >
        <X size={16} />
      </button>

      <div className={`alert-banner-icon alert-banner-icon-${variant}`}>
        {ICONS[variant]}
      </div>

      <div className="alert-banner-content">
        <h3 className="alert-banner-title">{title}</h3>
        {description && (
          <div className="alert-banner-description">{description}</div>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="alert-banner-actions">
            {secondaryAction && (
              <button
                className="alert-banner-action-secondary"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                className="alert-banner-action-primary"
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
