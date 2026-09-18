"use client";

// ─── Shared primitives ────────────────────────────────────────────────────────

export const card: React.CSSProperties = {
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,.07)",
  borderRadius: 14,
  overflow: "hidden",
  marginBottom: 16,
};

export const cardHeader: React.CSSProperties = {
  padding: "14px 20px",
  borderBottom: "1px solid rgba(255,255,255,.06)",
};

export const cardBody: React.CSSProperties = {
  padding: "20px",
};

export const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#9A9A9A",
  marginBottom: 6,
  letterSpacing: "0.02em",
};

export const input: React.CSSProperties = {
  width: "100%",
  background: "#2A2A2A",
  border: "1px solid rgba(255,255,255,.10)",
  color: "#ffffff",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

export const inputError: React.CSSProperties = {
  ...input,
  border: "1px solid rgba(220,38,38,0.5)",
};

export const saveBtn = (disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 8,
  border: "none",
  background: disabled ? "rgba(255,255,255,.08)" : "#ffffff",
  color: disabled ? "#6B6B6B" : "#000000",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s",
});

export const dangerBtn = (disabled: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 8,
  border: "1px solid rgba(220,38,38,0.3)",
  background: "rgba(220,38,38,0.08)",
  color: disabled ? "#9A9A9A" : "#ef4444",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s",
});

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#6B6B6B",
        margin: 0,
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}

export function StatusMsg({ type, children }: { type: "error" | "success" | "info"; children: React.ReactNode }) {
  const colors = {
    error: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.25)", text: "#ef4444" },
    success: { bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.25)", text: "#10b981" },
    info: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)", text: "#9A9A9A" },
  }[type];
  return (
    <div
      style={{
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 8,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        fontSize: 13,
        color: colors.text,
      }}
    >
      {children}
    </div>
  );
}

// ─── Plan & usage ─────────────────────────────────────────────────────────────
