import { useEffect, useRef, useCallback } from "react"

export function useVoiceCommands({ onDescribe, onStartContinuous, onStopContinuous, onSilence, enabled }) {
  const recognitionRef = useRef(null)
  const restartRef = useRef(null)

  const stop = useCallback(() => {
    clearTimeout(restartRef.current)
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim()
      console.log("Comando escuchado:", transcript)

      if (transcript.includes("describir")) onDescribe()
      else if (transcript.includes("continuo")) onStartContinuous()
      else if (transcript.includes("detener") || transcript.includes("parar")) onStopContinuous()
      else if (transcript.includes("silencio") || transcript.includes("silenciar")) onSilence()
    }

    // Reinicia automáticamente al terminar para escuchar siempre
    recognition.onend = () => {
      restartRef.current = setTimeout(() => {
        if (recognitionRef.current) start()
      }, 300)
    }

    recognition.onerror = (e) => {
      if (e.error === "not-allowed") {
        console.warn("Micrófono no permitido")
        stop()
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onDescribe, onStartContinuous, onStopContinuous, onSilence, stop])

  useEffect(() => {
    if (enabled) start()
    else stop()
    return () => stop()
  }, [enabled, start, stop])
}