export default function DescriptionBox({ description, timestamp }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        padding: "18px 20px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        minHeight: 90,
      }}
    >
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--text-main)" }}>
        {description}
      </p>
      {timestamp && (
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "block" }}>
          {timestamp}
        </span>
      )}
    </div>
  )
}