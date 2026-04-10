"""
Money Magnet AI — Flask Backend
Handles expense storage, ML predictions, and AI insights.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from models.predictor import SpendingPredictor
from flask import render_template
from ai.groq_client import ask_ai


app = Flask(__name__)
@app.route("/")
def home():
    return render_template("index.html")
CORS(app)

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "expenses.json")

# ─── Helpers ─────────────────────────────────────────────────────────────────

def load_expenses():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_expenses(expenses):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(expenses, f, indent=2)

predictor = SpendingPredictor()

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    return jsonify(load_expenses())


@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.json
    expenses = load_expenses()

    entry = {
        "id": len(expenses) + 1,
        "amount": float(data["amount"]),
        "category": data["category"],
        "mood": data["mood"],
        "reason": data.get("reason", ""),
        "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
        "time": datetime.now().strftime("%H:%M"),
        "day_of_week": datetime.now().strftime("%A"),
        "is_weekend": datetime.now().weekday() >= 5,
    }
    expenses.append(entry)
    save_expenses(expenses)

    # Re-train predictor after new data
    if len(expenses) >= 5:
        predictor.train(expenses)

    return jsonify({"success": True, "expense": entry}), 201


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    expenses = load_expenses()
    expenses = [e for e in expenses if e["id"] != expense_id]
    save_expenses(expenses)
    return jsonify({"success": True})


@app.route("/api/stats", methods=["GET"])
def get_stats():
    expenses = load_expenses()
    if not expenses:
        return jsonify({"total": 0, "by_category": {}, "by_mood": {}, "count": 0})

    total = sum(e["amount"] for e in expenses)
    by_category = {}
    by_mood = {}
    by_day = {}

    for e in expenses:
        by_category[e["category"]] = by_category.get(e["category"], 0) + e["amount"]
        by_mood[e["mood"]] = by_mood.get(e["mood"], 0) + e["amount"]
        day = e.get("day_of_week", "Unknown")
        by_day[day] = by_day.get(day, 0) + e["amount"]

    top_mood = max(by_mood, key=by_mood.get) if by_mood else "N/A"
    top_category = max(by_category, key=by_category.get) if by_category else "N/A"

    return jsonify({
        "total": round(total, 2),
        "count": len(expenses),
        "by_category": by_category,
        "by_mood": by_mood,
        "by_day": by_day,
        "top_mood": top_mood,
        "top_category": top_category,
        "avg_per_expense": round(total / len(expenses), 2),
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """Predict overspending risk for today."""
    expenses = load_expenses()
    if len(expenses) < 5:
        return jsonify({
            "risk": "low",
            "risk_score": 0.0,
            "message": "Add more expenses to unlock predictions!",
            "confidence": 0,
        })

    data = request.json
    mood = data.get("mood", "neutral")
    is_weekend = datetime.now().weekday() >= 5
    hour = datetime.now().hour

    predictor.train(expenses)
    result = predictor.predict(mood, is_weekend, hour, expenses)
    return jsonify(result)


@app.route("/api/personality", methods=["GET"])
def get_personality():
    """Analyze spending personality."""
    expenses = load_expenses()
    if len(expenses) < 3:
        return jsonify({"personality": "Unknown", "description": "Add more expenses."})

    predictor.train(expenses)
    result = predictor.analyze_personality(expenses)
    return jsonify(result)


@app.route("/api/insights", methods=["GET"])
def get_insights():
    """Rule-based insights from spending patterns."""
    expenses = load_expenses()
    insights = []

    if len(expenses) < 2:
        return jsonify({"insights": ["Add more expenses to unlock insights!"]})

    by_mood = {}
    for e in expenses:
        by_mood.setdefault(e["mood"], []).append(e["amount"])

    for mood, amounts in by_mood.items():
        avg = sum(amounts) / len(amounts)
        if avg > 500 and mood in ["stressed", "sad", "anxious"]:
            insights.append(f"⚠️ You spend ₹{avg:.0f} on average when {mood}. Watch out!")
        elif mood == "happy" and avg < 300:
            insights.append(f"✅ When happy, you spend wisely (avg ₹{avg:.0f}).")

    by_category = {}
    for e in expenses:
        by_category.setdefault(e["category"], []).append(e["amount"])

    for cat, amounts in by_category.items():
        if len(amounts) > 2:
            insights.append(f"📌 You've spent on {cat} {len(amounts)} times (₹{sum(amounts):.0f} total).")

    weekend_total = sum(e["amount"] for e in expenses if e.get("is_weekend"))
    weekday_total = sum(e["amount"] for e in expenses if not e.get("is_weekend"))
    if weekend_total > weekday_total * 1.5:
        insights.append("📅 Weekend spending is 50% higher than weekday spending.")

    if not insights:
        insights.append("🧠 Keep logging expenses to reveal patterns!")

    return jsonify({"insights": insights})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "1.0.0"})
@app.route("/api/ask-ai", methods=["POST"])
def ask_ai_route():
    data = request.json
    question = data.get("question")

    # load expenses from your JSON or memory
    expenses = load_expenses()   # your existing function

    answer = ask_ai(question, expenses)

    return jsonify({"response": answer})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
