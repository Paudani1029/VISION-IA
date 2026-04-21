export default function Controls({ loading, continuous, detailLevel, onDescribe, onToggleContinuous, onDetailChange }) {
  return (
    <div style={{
      padding: "16px 20px",
      background: "var(--bg-app)",
      borderTop: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      paddingBottom: "max(16px, env(safe-area-inset-bottom))"
    }}>

      {/* Botón principal — grande para fácil acceso táctil */}
      <button
        onClick={onDescribe}
        disabled={loading}
        aria-label="Describir lo que ve la cámara ahora"
        style={{
          padding: 18,
          background: "var(--accent)",
          borderRadius: "var(--radius-lg)",
          color: "white",
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        {loading ? "Analizando..." : "Describir ahora"}
      </button>

      <div style={{ display: "flex", gap: 10 }}>
        {/* Modo continuo */}
        <button
          onClick={onToggleContinuous}
          aria-pressed={continuous}
          aria-label={continuous ? "Desactivar modo continuo" : "Activar modo continuo"}
          style={{
            flex: 1, padding: 13,
            background: continuous ? "var(--accent)" : "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            color: continuous ? "white" : "var(--text-muted)",
            fontSize: 13, fontWeight: 500,
            border: `1px solid ${continuous ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          {continuous ? "● Continuo" : "○ Continuo"}
        </button>

        {/* Nivel de detalle */}
        <select
          value={detailLevel}
          onChange={e => onDetailChange(e.target.value)}
          aria-label="Nivel de detalle de la descripción"
          style={{
            flex: 1, padding: 13,
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-main)",
            fontSize: 13,
            border: "1px solid var(--border)",
          }}
        >
          <option value="short">Descripción corta</option>
          <option value="medium">Descripción media</option>
          <option value="detailed">Muy detallada</option>
        </select>
      </div>

      {/* Botón silenciar voz */}
      <button
        onClick={() => window.speechSynthesis.cancel()}
        aria-label="Silenciar la voz"
        style={{
          padding: 12,
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-muted)",
          fontSize: 13,
          border: "1px solid var(--border)",
        }}
      >
        Silenciar voz
      </button>
    </div>
  )
}