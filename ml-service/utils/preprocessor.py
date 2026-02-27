import re

def preprocess(text: str) -> str:
    """
    Clean and normalize input text for scam detection.
    """
    if not text:
        return ""

    # Lowercase
    text = text.lower()

    # Remove special characters but keep spaces
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def extract_numbers(text: str) -> list:
    """
    Extract any money amounts mentioned in text.
    """
    # Match patterns like Rs 50,000 or 50000 or 5 lakh
    amounts = re.findall(r"(?:rs\.?\s*)?[\d,]+(?:\s*(?:lakh|crore|thousand))?", text.lower())
    return [a.strip() for a in amounts if a.strip()]


def get_call_duration_risk(duration_seconds: int) -> dict:
    """
    Assess risk based on suspicious call duration patterns.
    Scammers often keep victims on long calls.
    """
    if duration_seconds >= 1800:  # 30+ minutes
        return {"level": "HIGH", "score": 30, "note": "Very long call duration — classic digital arrest pattern"}
    elif duration_seconds >= 600:  # 10+ minutes
        return {"level": "MEDIUM", "score": 15, "note": "Extended call — monitor for scam signs"}
    else:
        return {"level": "LOW", "score": 0, "note": "Normal call duration"}
