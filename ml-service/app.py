from flask import Flask, request, jsonify
from flask_cors import CORS
from scam_detector import analyze_transcript
from bank_shield import evaluate_transaction, get_cooling_status, guardian_approve
import uuid

app = Flask(__name__)
CORS(app)  # Allow Node.js backend to call this service


# ============================================================
# HEALTH CHECK
# ============================================================
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ShieldSenior ML Service", "version": "1.0"})


# ============================================================
# ROUTE 1: Analyze Transcript
# POST /api/analyze
# Body: { "transcript": "..." }
# ============================================================
@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "transcript" not in data:
        return jsonify({"error": "Missing 'transcript' field in request body"}), 400

    transcript = data["transcript"].strip()

    if not transcript:
        return jsonify({"error": "Transcript cannot be empty"}), 400

    result = analyze_transcript(transcript)
    return jsonify(result), 200


# ============================================================
# ROUTE 2: Check Transaction (BankShield)
# POST /api/transaction/check
# Body: { "amount": 50000, "risk_score": 87, "call_duration": 900 }
# ============================================================
@app.route("/api/transaction/check", methods=["POST"])
def check_transaction():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    amount = data.get("amount", 0)
    risk_score = data.get("risk_score", 0)
    call_duration = data.get("call_duration", 0)

    # Generate unique transaction ID
    transaction_id = data.get("transaction_id", str(uuid.uuid4())[:8].upper())

    result = evaluate_transaction(transaction_id, amount, risk_score, call_duration)
    return jsonify(result), 200


# ============================================================
# ROUTE 3: Get Cooling Status
# GET /api/transaction/status/<transaction_id>
# ============================================================
@app.route("/api/transaction/status/<transaction_id>", methods=["GET"])
def cooling_status(transaction_id):
    result = get_cooling_status(transaction_id)
    return jsonify(result), 200


# ============================================================
# ROUTE 4: Guardian Approve/Reject
# POST /api/transaction/approve
# Body: { "transaction_id": "XYZ123", "approved": true, "guardian_name": "Rahul" }
# ============================================================
@app.route("/api/transaction/approve", methods=["POST"])
def approve_transaction():
    data = request.get_json()

    if not data or "transaction_id" not in data:
        return jsonify({"error": "Missing transaction_id"}), 400

    transaction_id = data["transaction_id"]
    approved = data.get("approved", False)
    guardian_name = data.get("guardian_name", "Guardian")

    result = guardian_approve(transaction_id, approved, guardian_name)
    return jsonify(result), 200


# ============================================================
# ROUTE 5: Full Scam + Transaction Flow (Combined)
# POST /api/shield
# Body: { "transcript": "...", "amount": 50000, "call_duration": 900 }
# ============================================================
@app.route("/api/shield", methods=["POST"])
def full_shield_check():
    """
    One-shot endpoint: analyze transcript + evaluate transaction together.
    This is the MAIN endpoint P3 (backend) will call.
    """
    data = request.get_json()

    if not data or "transcript" not in data:
        return jsonify({"error": "Missing 'transcript' field"}), 400

    transcript = data["transcript"]
    amount = data.get("amount", 0)
    call_duration = data.get("call_duration", 0)
    transaction_id = data.get("transaction_id", str(uuid.uuid4())[:8].upper())

    # Step 1: Analyze transcript
    scam_result = analyze_transcript(transcript)
    risk_score = scam_result.get("risk_score", 0)

    # Step 2: Evaluate transaction using risk score
    transaction_result = None
    if amount > 0:
        transaction_result = evaluate_transaction(transaction_id, amount, risk_score, call_duration)

    return jsonify({
        "scam_analysis": scam_result,
        "transaction_shield": transaction_result,
    }), 200


# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
