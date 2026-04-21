import { useCallback } from "react"

export function useSpeech() {
  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak }
}