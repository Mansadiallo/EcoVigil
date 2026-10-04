import { T, TITRE_GRAND } from "../lib/typo.jsx";

export function TreeRing({ pct = 0, size = 56, stroke = 6, color = "var(--c-accent)", bg = "var(--c-border-soft)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
    </svg>
  );
}

export function Screen({ children }) { return <div style={{ padding: "16px 16px 90px" }}>{children}</div>; }

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...TITRE_GRAND, fontWeight: 600, color: "var(--c-accent-dark)" }}>{children}</div>
      {sub && <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function StatCard({ label, value, unit, accent }) {
  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: "12px 14px", flex: 1, border: "1px solid var(--c-border)" }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 22, fontWeight: 600, color: accent || "var(--c-accent-dark)" }}>
        {value}<span style={{ fontSize: T.small, marginLeft: 3, color: "var(--c-text-muted)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 2, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
