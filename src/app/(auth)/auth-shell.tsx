import { Logo } from "@/components/logo";

export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.04)',
  border: '1px solid rgba(0,0,0,.12)',
  color: '#0A0A0A',
  borderRadius: 8,
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

export const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid rgba(220,38,38,0.5)',
};

export function AuthShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        background: '#0A0A0A',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Logo href="/" iconSize={32} onDark />
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,.06)',
            borderRadius: 28,
            padding: '32px 28px',
          }}
        >
          {children}
        </div>

        {footer}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
