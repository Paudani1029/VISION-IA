from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import base64
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash-lite")

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
    "short": "Describe brevemente en 1 oración qué ves en esta imagen. Sé directo y claro.",
    "medium": "Describe esta imagen en 2-3 oraciones para una persona con discapacidad visual. Menciona objetos principales, personas y el entorno.",
    "detailed": "Describe esta imagen con detalle para una persona con discapacidad visual. Incluye: objetos presentes, personas, colores relevantes, texto visible, y cualquier información útil para orientarse en el espacio.",
}

@app.post("/describe")
async def describe_image(req: ImageRequest):
    try:
        image_data = base64.b64decode(req.image_base64)
        image_part = {"mime_type": "image/jpeg", "data": image_data}
        prompt = PROMPTS.get(req.detail_level, PROMPTS["medium"])

        response = model.generate_content([prompt, image_part])
        return {"description": response.text}

    except Exception as e:
        print(f"ERROR DETALLADO: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/modelos")
def listar_modelos():
    modelos = []
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            modelos.append(m.name)
    return {"modelos": modelos}