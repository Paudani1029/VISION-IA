from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import base64
import os
from dotenv import load_dotenv

SYSTEM_PROMPT = """
Eres un asistente visual para personas con discapacidad visual.

Tu objetivo es ayudar a orientarse y comprender el entorno de manera rápida y útil.

Prioridades:
1. Obstáculos y peligros
2. Personas y sus posiciones
3. Objetos importantes
4. Texto visible
5. Orientación espacial y rutas

Describe:
- posiciones relativas (izquierda, derecha, frente, detrás)
- distancias aproximadas
- movimiento de personas u objetos
- elementos útiles para desplazarse

NO describas salvo que sea importante:
- iluminación
- sombras
- ambiente visual
- decoración
- estética
- colores irrelevantes
- detalles artísticos

Evita frases largas y descripciones cinematográficas.

Responde de forma:
- breve
- clara
- directa
- útil para navegación y orientación

Si no estás seguro de algo, dilo claramente.
No inventes información.
"""


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image_base64: str
    detail_level: str = "medium"

PROMPTS = {
    "short": (
        "Describe la escena en 1 oración corta. "
        "Prioriza obstáculos, personas y objetos importantes."
    ),

    "medium": (
        "Describe brevemente la escena para una persona con discapacidad visual. "
        "Prioriza posiciones, objetos importantes, personas y orientación espacial."
    ),

    "detailed": (
        "Describe detalladamente la escena para una persona con discapacidad visual. "
        "Incluye posiciones relativas, distancias aproximadas, obstáculos, "
        "texto visible y elementos útiles para desplazarse."
    ),
}

@app.post("/describe")
async def describe_image(req: ImageRequest):
    try:
        prompt = PROMPTS.get(req.detail_level, PROMPTS["medium"])

        # ⚠️ Formato correcto para OpenAI
        image_url = f"data:image/jpeg;base64,{req.image_base64}"

        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": SYSTEM_PROMPT
                        }
                    ],
                },
                
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": prompt},
                        {
                            "type": "input_image",
                            "image_url": image_url,
                        },
                    ],
                }
            ],
        )

        return {"description": response.output_text}

    except Exception as e:
        print(f"ERROR DETALLADO: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/health")
def health():
    return {"status": "ok"}

