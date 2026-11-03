from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator
import translators as ts
import time
import whisper
import shutil
import os
import re
from fastapi import UploadFile, File


whisper_model = whisper.load_model("small")

summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

app = FastAPI()
# A list of common Hinglish offensive words and slang
hinglish_slang = {
    "pagal", "bakwas", "bewakoof", "gadha", "kutta", "kaminey", 
    "saale", "harami", "chutiya", "bhosdike", "madarchod", "behenchod"
}


negative_words = {
    "no", "nahi", "na", "nhi", "kharab", "bekar", "ganda", "ghatiya",
    "bura", "hate", "nafrat", "sad", "dukhi", "faltu", "boring", "wahiyat","bad","kutte"
}

positive_words = {
    "achha", "achhi", "acha", "achi", "good", "great", "mast", "badhiya",
    "badiya", "super", "superb", "love", "pasand", "best", "lajawab", "zabardast", "op","acchi","accha","perfect"
}

def contains_slang(text: str) -> bool:
    words = set(text.lower().split())
    # Check if any word in the sentence matches our slang dictionary
    return bool(words.intersection(hinglish_slang))

# def get_text_sentiment(text: str):
#     # 1. Clean the text (strip punctuation so dictionary words match perfectly)
#     clean_text = re.sub(r'[^\w\s]', '', text.lower())
#     words = set(clean_text.split())
    
#     # 2. Rule-Based Guardrails (Catches obvious strong sentiments and slang)
#     if words.intersection(hinglish_slang) or words.intersection(negative_words):
#         return "Negative"
#     elif words.intersection(positive_words):
#         return "Positive"
        
#     # 3. AI Model Fallback (The core engine processes all ambiguous/neutral sentences)
#     result = classifier(text)[0]
#     label_map = {"LABEL_0": "Negative", "LABEL_1": "Neutral", "LABEL_2": "Positive"}
#     return label_map.get(result["label"], "Neutral")
def get_text_sentiment(text: str):
    clean_text = re.sub(r'[^\w\s]', '', text.lower())
    words = set(clean_text.split())
    
    # Check for slang specifically
    has_slang = bool(words.intersection(hinglish_slang))
    
    # 1. Lexicon check for Negative/Slang
    if has_slang or words.intersection(negative_words):
        return "Negative", has_slang
        
    # 2. Lexicon check for Positive
    elif words.intersection(positive_words):
        return "Positive", False
        
    # 3. Strict fallback to Neutral
    return "Neutral", False

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

# Load a highly efficient, lightweight toxicity model
toxicity_classifier = pipeline("text-classification", model="martin-ha/toxic-comment-model")

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict_sentiment(request: TextRequest):
    text = request.text
    words = set(text.lower().split())
    
    # 1. Run the base AI model (to keep generating a confidence score for your frontend)
    result = classifier(text)[0]
    confidence = round(result["score"], 4)
    
    # 2. Rule-Based Sentiment Override
    if words.intersection(hinglish_slang) or words.intersection(negative_words):
        sentiment = "Negative"
    elif words.intersection(positive_words):
        sentiment = "Positive"
    else:
        sentiment = "Neutral"
    
    # 3. Hybrid Toxicity & Slang Detection
    is_toxic = False
    tox_score = 0.0
    
    if words.intersection(hinglish_slang):
        is_toxic = True
        tox_score = 1.0
    else:
        try:
            translated_text = ts.translate_text(text, translator='bing', to_language='en')
            tox_result = toxicity_classifier(translated_text)[0]
            
            if tox_result['label'].lower() == 'toxic':
                is_toxic = True
                tox_score = round(tox_result['score'], 4)
        except Exception:
            pass

    return {
        "text": text, 
        "sentiment": sentiment, 
        "confidence_score": confidence,
        "is_toxic": is_toxic,
        "toxicity_score": tox_score
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


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # 1. language="en" forces the English alphabet to prevent Spanish hallucinations
        # 2. initial_prompt guides the model to expect Romanized Hindi/Hinglish phrasing
        # 3. condition_on_previous_text=False prevents repetitive loops on short audio
        result = whisper_model.transcribe(
            temp_file_path,
            language="en",
            initial_prompt="Hello bhai, kya haal hai? Aaj tum kaise ho? Sab theek hai.",
            condition_on_previous_text=False,
            fp16=False # Prevents warnings on CPU execution
        )
        text = result["text"].strip()
        return {"transcribed_text": text}
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)



@app.post("/analyze-chat")
async def analyze_chat(file: UploadFile = File(...)):
    # 1. Read and parse the file
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    lines = text.split("\n")
    
    # 2. Extract messages
    messages = []
    for line in lines:
        if "<Media omitted>" in line or "omitted" in line or "encrypted" in line:
            continue
        parts = line.split(": ", 1)
        if len(parts) > 1:
            messages.append(parts[1].strip())
            
    # 3. Sample the latest 20 messages
    sample_messages = [m for m in messages[-20:] if m]
    stats = {"Positive": 0, "Neutral": 0, "Negative": 0}
    
    chat_details = []
    full_english_text = ""
    
    for msg in sample_messages:
        # Unpack both variables returned by the helper function
        sentiment, has_slang = get_text_sentiment(msg)
        
        if sentiment in stats:
            stats[sentiment] += 1
            
        # Translate each message for the UI
        try:
            translated_msg = ts.translate_text(msg, translator='bing', to_language='en')
        except Exception:
            translated_msg = msg
            
        chat_details.append({
            "original": msg,
            "translated": translated_msg,
            "sentiment": sentiment,
            "has_slang": has_slang  # This line sends the flag to React
        })
        
        full_english_text += translated_msg + ". "
        
    # Generate Chat Summary
    try:
        input_length = len(full_english_text.split())
        if input_length > 15:
            # dynamically set max_length so it doesn't crash on short chats
            summary_out = summarizer(full_english_text, max_length=min(60, input_length), min_length=5, do_sample=False)
            summary_text = summary_out[0]['summary_text']
        else:
            summary_text = full_english_text
    except Exception:
        summary_text = "Summary unavailable for this text."
            
    return {
        "total_found": len(messages),
        "analyzed": len(sample_messages),
        "distribution": [
            {"name": "Positive", "value": stats["Positive"], "color": "#4E8069"},
            {"name": "Neutral", "value": stats["Neutral"], "color": "#D5A458"},
            {"name": "Negative", "value": stats["Negative"], "color": "#C8756D"}
        ],
        "chat_details": chat_details,
        "summary": summary_text
    }