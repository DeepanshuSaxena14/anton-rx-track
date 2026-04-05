export default function AuthLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Ghost text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(10rem, 25vw, 30rem)',
          color: 'rgba(33,34,38,0.04)',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontWeight: 500,
          userSelect: 'none',
        }}
      >
        ACCESS
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: 'var(--fg)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          CoverageIQ
        </h1>

        {/* Pulsing line */}
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'var(--fg-3)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--fg-3)',
          }}
        >
          Authenticating
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
