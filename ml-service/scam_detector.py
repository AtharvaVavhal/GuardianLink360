import json
import os
import re
import requests
from utils.preprocessor import preprocess
from utils.scorer import build_response, calculate_risk_level

# Load keyword rules
KEYWORDS_PATH = os.path.join(os.path.dirname(__file__), "models", "scam_keywords.json")
with open(KEYWORDS_PATH, "r") as f:
    KEYWORD_RULES = json.load(f)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"


# ============================================================
# LAYER 1: Gemini AI Detection
# ============================================================
def detect_with_gemini(transcript: str) -> dict:
    prompt = f"""
You are an AI cybercrime detection assistant trained to detect "Digital Arrest" scams targeting senior citizens in India.

Analyze the following transcript carefully and respond ONLY in valid JSON format like this:
{{
  "risk_score": <integer 0-100>,
  "scam_type": "<type of scam or 'No Scam Detected'>",
  "threat_level": "<LOW | MEDIUM | HIGH>",
  "psychological_tactics": ["<tactic1>", "<tactic2>"],
  "reason": "<simple explanation in 1-2 sentences in simple language>",
  "recommended_action": "<clear, actionable advice for a senior citizen>"
}}

Common scam patterns to detect:
- Authority impersonation (CBI, Police, RBI, Income Tax, TRAI)
- Digital Arrest threat
- Urgency and fear tactics
- Money/UPI transfer demand
- OTP or credential theft
- Isolation from family

Transcript:
\"\"\"
{transcript}
\"\"\"

Return ONLY the JSON. No text outside the JSON block.
"""

    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    headers = {"Content-Type": "application/json"}

    response = requests.post(GEMINI_URL, json=payload, headers=headers, timeout=15)
    response.raise_for_status()

    data = response.json()
    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

    # Strip markdown code block if present
    clean = re.sub(r"```json|```", "", raw_text).strip()
    result = json.loads(clean)
    result["source"] = "gemini_ai"
    result["triggers_found"] = result.get("psychological_tactics", [])
    return result


# ============================================================
# LAYER 2: Keyword Fallback Detection
# ============================================================
def detect_with_keywords(transcript: str) -> dict:
    text = preprocess(transcript)

    score = 0
    triggers = []

    for category, rule in KEYWORD_RULES.items():
        for kw in rule["keywords"]:
            if kw in text:
                score += rule["weight"]
                triggers.append(category.replace("_", " ").title())
                break  # each category counted once

    score = min(score, 100)

    scam_type = "Digital Arrest / Cyber Fraud" if triggers else "No Scam Detected"
    reason = (
        f"Suspicious patterns detected: {', '.join(triggers)}."
        if triggers
        else "No significant scam indicators found in this message."
    )

    return build_response(score, scam_type, triggers, reason, "keyword_fallback")


# ============================================================
# MAIN ENTRY — Called by Flask routes
# ============================================================
def analyze_transcript(transcript: str) -> dict:
    """
    Try Gemini AI first. If it fails, use keyword fallback.
    Always returns a valid response dict.
    """
    if not transcript or not transcript.strip():
        return build_response(0, "No Input", [], "Empty transcript provided.", "system")

    # Try Gemini AI
    if GEMINI_API_KEY:
        try:
            result = detect_with_gemini(transcript)
            return result
        except Exception as e:
            print(f"[Gemini Failed] {e} — switching to keyword fallback")

    # Fallback to keyword detection
    return detect_with_keywords(transcript)
