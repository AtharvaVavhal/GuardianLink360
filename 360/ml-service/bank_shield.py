import time

# In-memory store for frozen transactions (use DB in production)
frozen_transactions = {}

COOLING_PERIOD_SECONDS = 1800  # 30 minutes
HIGH_RISK_THRESHOLD = 70
HIGH_AMOUNT_THRESHOLD = 10000  # Rs 10,000


def evaluate_transaction(transaction_id: str, amount: float, risk_score: int, call_duration_seconds: int = 0) -> dict:
    """
    Decide whether to freeze a transaction based on:
    - AI risk score from scam detection
    - Transaction amount
    - Call duration (long calls = higher suspicion)
    """

    reasons = []
    should_freeze = False

    if risk_score >= HIGH_RISK_THRESHOLD:
        reasons.append(f"High scam risk score: {risk_score}/100")
        should_freeze = True

    if amount >= HIGH_AMOUNT_THRESHOLD and risk_score >= 40:
        reasons.append(f"Large amount (Rs {amount:,.0f}) during suspicious activity")
        should_freeze = True

    if call_duration_seconds >= 600 and risk_score >= 40:
        reasons.append(f"Long call duration ({call_duration_seconds // 60} min) with suspicious patterns")
        should_freeze = True

    if should_freeze:
        frozen_transactions[transaction_id] = {
            "transaction_id": transaction_id,
            "amount": amount,
            "risk_score": risk_score,
            "frozen_at": time.time(),
            "status": "FROZEN",
            "reasons": reasons,
        }
        return {
            "status": "FROZEN",
            "transaction_id": transaction_id,
            "amount": amount,
            "risk_score": risk_score,
            "reasons": reasons,
            "cooling_period_minutes": COOLING_PERIOD_SECONDS // 60,
            "message": (
                f"🚨 Transaction FROZEN for {COOLING_PERIOD_SECONDS // 60} minutes. "
                "Guardian approval required. Cyber Crime Helpline: 1930."
            ),
            "guardian_approval_required": True,
        }
    else:
        return {
            "status": "ALLOWED",
            "transaction_id": transaction_id,
            "amount": amount,
            "risk_score": risk_score,
            "reasons": ["Transaction appears safe based on current risk assessment"],
            "message": "✅ Transaction approved. Stay alert and never share OTP with anyone.",
            "guardian_approval_required": False,
        }


def get_cooling_status(transaction_id: str) -> dict:
    """
    Check how much time is remaining in the cooling period.
    """
    if transaction_id not in frozen_transactions:
        return {"status": "NOT_FOUND", "transaction_id": transaction_id}

    txn = frozen_transactions[transaction_id]
    elapsed = time.time() - txn["frozen_at"]
    remaining = max(0, COOLING_PERIOD_SECONDS - elapsed)

    if remaining == 0:
        txn["status"] = "COOLING_EXPIRED"
        return {
            "status": "COOLING_EXPIRED",
            "transaction_id": transaction_id,
            "message": "Cooling period ended. Guardian must approve or reject.",
        }

    minutes_left = int(remaining // 60)
    seconds_left = int(remaining % 60)

    return {
        "status": "FROZEN",
        "transaction_id": transaction_id,
        "amount": txn["amount"],
        "risk_score": txn["risk_score"],
        "remaining_time": f"{minutes_left:02d}:{seconds_left:02d}",
        "remaining_seconds": int(remaining),
        "message": f"Transaction frozen. {minutes_left}m {seconds_left}s remaining before guardian can act.",
    }


def guardian_approve(transaction_id: str, approved: bool, guardian_name: str = "Guardian") -> dict:
    """
    Guardian approves or rejects a frozen transaction.
    """
    if transaction_id not in frozen_transactions:
        return {"status": "NOT_FOUND", "transaction_id": transaction_id}

    action = "APPROVED" if approved else "REJECTED"
    frozen_transactions[transaction_id]["status"] = action
    frozen_transactions[transaction_id]["guardian_action"] = guardian_name

    return {
        "status": action,
        "transaction_id": transaction_id,
        "guardian": guardian_name,
        "message": (
            f"✅ Transaction {action} by {guardian_name}."
            if approved
            else f"❌ Transaction BLOCKED by {guardian_name}. Senior citizen is safe."
        ),
    }
