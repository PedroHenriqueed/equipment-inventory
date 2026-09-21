import type { HTMLAttributes } from "react";
import clsx from "clsx";

export type EquipmentStatus =
  | "em-uso"
  | "disponivel"
  | "emprestimo"
  | "manutencao";

const statusColors: Record<EquipmentStatus, string> = {
  "em-uso": "bg-blue-500",
  disponivel: "bg-emerald-500",
  emprestimo: "bg-amber-500",
  manutencao: "bg-red-500",
};

const statusLabels: Record<EquipmentStatus, string> = {
  "em-uso": "Em uso",
  disponivel: "Disponível",
  emprestimo: "Empréstimo",
  manutencao: "Em manutenção",
};

export type StatusProps = HTMLAttributes<HTMLSpanElement> & {
  status: EquipmentStatus;
};

export const Status = ({ className, status, ...props }: StatusProps) => (
  <span
    className={clsx(
      "inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      "bg-secondary text-secondary-foreground",
      className,
    )}
    {...props}
  >
    <StatusIndicator status={status} />
    <StatusLabel status={status} />
  </span>
);

export type StatusIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  status: EquipmentStatus;
};

export const StatusIndicator = ({
  className,
  status,
  ...props
}: StatusIndicatorProps) => (
  <span className="relative flex h-2 w-2" {...props}>
    <span
      className={clsx(
        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
        statusColors[status],
      )}
    />
    <span
      className={clsx(
        "relative inline-flex h-2 w-2 rounded-full",
        statusColors[status],
      )}
    />
  </span>
);

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement> & {
  status: EquipmentStatus;
  children?: React.ReactNode;
};

export const StatusLabel = ({
  className,
  status,
  children,
  ...props
}: StatusLabelProps) => (
  <span className={clsx("text-muted-foreground", className)} {...props}>
    {children ?? statusLabels[status]}
  </span>
);
