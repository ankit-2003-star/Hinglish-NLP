from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator
import translators as ts
import time

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the fine-tuned local model
classifier = pipeline("text-classification", model="./final_hinglish_model", tokenizer="./final_hinglish_model")

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict_sentiment(request: TextRequest):
    result = classifier(request.text)[0]
    
    # Map the model's default LABEL_X back to human-readable sentiments
    label_map = {"LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive"}
    sentiment = label_map.get(result["label"], result["label"])
    
    return {
        "text": request.text, 
        "sentiment": sentiment, 
        "confidence_score": round(result["score"], 4)
    }

class TranslateRequest(BaseModel):
    text: str

# @app.post("/translate")
# def translate_text(request: TranslateRequest):
#     try:
#         # Auto-detects Hinglish/Hindi and translates to standard English
#         translated = GoogleTranslator(source='auto', target='en').translate(request.text)
#         return {"translated_text": translated}
#     except Exception as e:
#         return {"error": str(e)}
import translators as ts
from pydantic import BaseModel

class TranslateRequest(BaseModel):
    text: str

@app.post("/translate")
def translate_text(request: TranslateRequest):
    try:
        # Attempt 1: Route through Bing to bypass Google's IP block
        translated = ts.translate_text(request.text, translator='bing', to_language='en')
        return {"translated_text": translated}
        
    except Exception:
        try:
            # Attempt 2: Fallback to Google using the new library's routing
            translated = ts.translate_text(request.text, translator='google', to_language='en')
            return {"translated_text": translated}
            
        except Exception as e:
            return {"error": "Network blocked. Please disconnect and reconnect your Wi-Fi/Hotspot to reset your IP address."}