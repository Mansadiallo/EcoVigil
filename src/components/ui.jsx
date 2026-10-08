import { T, TITRE_GRAND } from "../lib/typo.jsx";

export function TreeRing({ pct = 0, size = 56, stroke = 6, color = "var(--ev-primary)", bg = "var(--ev-border)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} role="img" aria-label={`${Math.round(Math.min(pct, 100))} %`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
    </svg>
  );
}

export function Screen({ children }) { return <div style={{ padding: "16px 16px 90px" }}>{children}</div>; }

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...TITRE_GRAND, fontWeight: 600, color: "var(--ev-text)" }}>{children}</div>
      {sub && <div style={{ fontSize: T.body, color: "var(--ev-text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function StatCard({ label, value, unit, accent }) {
  return (
    <div style={{ background: "var(--ev-surface)", borderRadius: "var(--ev-radius)", padding: "12px 14px", flex: 1, border: "1px solid var(--ev-border)", boxShadow: "var(--ev-shadow)" }}>
      <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: accent || "var(--ev-primary)" }}>
        {value}<span style={{ fontSize: T.small, marginLeft: 3, color: "var(--ev-text-muted)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: T.small, color: "var(--ev-text-muted)", marginTop: 2, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
