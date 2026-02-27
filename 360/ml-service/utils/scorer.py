def calculate_risk_level(score: int) -> str:
    if score >= 70:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


def get_recommended_action(score: int, threat_level: str) -> str:
    if threat_level == "HIGH":
        return (
            "🚨 HIGH RISK! Do NOT transfer any money or share OTP/PIN. "
            "Hang up immediately. Contact a family member. "
            "Call Cyber Crime Helpline: 1930."
        )
    elif threat_level == "MEDIUM":
        return (
            "⚠️ SUSPICIOUS CALL. Do not act under pressure. "
            "Verify by calling the official government/bank helpline. "
            "Real government officers NEVER demand money over phone."
        )
    else:
        return (
            "✅ Appears safe, but stay alert. "
            "Never share OTP, PIN, or bank details with anyone on call. "
            "Government never demands payment over phone."
        )


def build_response(score: int, scam_type: str, triggers: list, reason: str, source: str) -> dict:
    threat_level = calculate_risk_level(score)
    return {
        "source": source,
        "risk_score": score,
        "threat_level": threat_level,
        "scam_type": scam_type,
        "triggers_found": triggers,
        "reason": reason,
        "recommended_action": get_recommended_action(score, threat_level),
    }
