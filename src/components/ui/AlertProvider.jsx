import { createContext, useCallback, useContext, useState } from "react";
import AlertBanner from "./AlertBanner";

const AlertContext = createContext(null);

let idCounter = 0;

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const dismiss = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    ({
      variant = "default",
      title,
      description,
      duration = 4000,
      primaryAction,
      secondaryAction,
    }) => {
      const id = ++idCounter;
      setAlerts((prev) => [
        ...prev,
        { id, variant, title, description, primaryAction, secondaryAction },
      ]);

      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const alertApi = {
    show: showAlert,
    success: (title, opts = {}) =>
      showAlert({ variant: "success", title, ...opts }),
    error: (title, opts = {}) =>
      showAlert({ variant: "destructive", title, ...opts }),
    warning: (title, opts = {}) =>
      showAlert({ variant: "warning", title, ...opts }),
  };

  return (
    <AlertContext.Provider value={alertApi}>
      {children}
      <div className="alert-banner-container">
        {alerts.map((a) => (
          <AlertBanner
            key={a.id}
            variant={a.variant}
            title={a.title}
            description={a.description}
            primaryAction={a.primaryAction}
            secondaryAction={a.secondaryAction}
            onDismiss={() => dismiss(a.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx)
    throw new Error("useAlert deve ser usado dentro de <AlertProvider>");
  return ctx;
}
