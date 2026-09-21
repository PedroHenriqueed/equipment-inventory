// src/components/Skeleton.jsx
export function Skeleton({ width = "100%", height = "1rem", className = "" }) {
  return <div className={`skeleton ${className}`} style={{ width, height }} />;
}

// Skeleton pronto para uma "linha" de tabela/lista
export function SkeletonRow({ columns = 4 }) {
  return (
    <div className="skeleton-row">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height="1.2rem" />
      ))}
    </div>
  );
}

// Skeleton para bloco de página inteira (cards, listas)
export function SkeletonList({ items = 5 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} height="3rem" className="skeleton-card" />
      ))}
    </div>
  );
}
