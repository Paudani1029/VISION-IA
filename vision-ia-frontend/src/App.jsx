import { useState, useRef, useEffect, useCallback } from "react"
import { useVoiceCommands } from "./hooks/comandoVoz"
import Camera from "./components/Camera"
import DescriptionBox from "./components/DescriptionBox"
import Controls from "./components/Controls"
import { useSpeech } from "./hooks/useSpeech"
import { useInterval } from "./hooks/useInterval"
import "./index.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function App() {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)

  const [description, setDescription] = useState("Apunta la cámara a tu entorno y presiona el botón.")
  const [timestamp,   setTimestamp]   = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [continuous,  setContinuous]  = useState(false)
  const [detailLevel, setDetailLevel] = useState("medium")
  const [cameraReady, setCameraReady] = useState(false)

  const { speak } = useSpeech()

  const [voiceEnabled, setVoiceEnabled] = useState(false)

  // Iniciar cámara trasera del teléfono
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        videoRef.current.srcObject = stream
        setCameraReady(true)
      })
      .catch(() => setDescription("No se pudo acceder a la cámara. Verifica los permisos del navegador."))
  }, [])

  const captureAndDescribe = useCallback(async () => {
    if (!cameraReady || loading) return

    // Captura el frame actual del video
    const canvas = canvasRef.current
    const video  = videoRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0)
    const base64 = canvas.toDataURL("image/jpeg", 0.75).split(",")[1]

    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/describe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64, detail_level: detailLevel }),
      })
      const data = await res.json()
      setDescription(data.description)
      setTimestamp(new Date().toLocaleTimeString("es-CL"))
      speak(data.description)
    } catch {
      const msg = "Error de conexión con el servidor."
      setDescription(msg)
      speak(msg)
    } finally {
      setLoading(false)
    }
  }, [cameraReady, loading, detailLevel, speak])

  // Modo continuo cada 5 segundos
  useInterval(captureAndDescribe, continuous ? 5000 : null)

  //Voz por comando
  useVoiceCommands({
    onDescribe: captureAndDescribe,
    onStartContinuous: () => setContinuous(true),
    onStopContinuous: () => setContinuous(false),
    onSilence: () => window.speechSynthesis.cancel(),
    enabled: voiceEnabled,
  })

  return (
    <main
      aria-label="Asistente visual VisionIA"
      style={{ maxWidth: 520, margin: "0 auto", height: "100dvh",
        display: "flex", flexDirection: "column", overflowY: "auto"}}
    >
      <h1 className="sr-only">VisionIA — Asistente visual con inteligencia artificial</h1>

      {/* Header */}
      <header style={{
        padding: "14px 20px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid var(--border)", background: "var(--bg-surface)"
      }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>VisionIA</span>
        <span style={{ fontSize: 12, color: continuous ? "var(--accent)" : "var(--text-muted)" }}>
          {continuous ? "● modo continuo activo" : "modo manual"}
        </span>
      </header>

      <Camera ref={videoRef} loading={loading} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <DescriptionBox description={description} timestamp={timestamp} />

      <Controls
        loading={loading}
        continuous={continuous}
        detailLevel={detailLevel}
        voiceEnabled={voiceEnabled}
        onDescribe={captureAndDescribe}
        onToggleContinuous={() => setContinuous(v => !v)}
        onDetailChange={setDetailLevel}
        onToggleVoice={() => setVoiceEnabled(v => !v)}
      />
    </main>
  )
}