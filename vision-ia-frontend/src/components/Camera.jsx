import { forwardRef } from "react"

const Camera = forwardRef(({ loading }, ref) => (
  <div style={{ flex: 1, position: "relative", background: "#000", minHeight: 240 }}>
    <video
      ref={ref}
      autoPlay playsInline muted
      aria-label="Vista de la cámara"
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
    {loading && (
      <div style={{
        position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.75)", color: "#94a3b8",
        padding: "6px 18px", borderRadius: 20, fontSize: 13,
        backdropFilter: "blur(4px)"
      }}>
        Analizando imagen...
      </div>
    )}
  </div>
))

Camera.displayName = "Camera"
export default Camera