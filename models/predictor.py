"""
Money Magnet AI — ML Predictor
Uses scikit-learn Logistic Regression + Decision Trees for spending analysis.
"""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import warnings

warnings.filterwarnings("ignore")

MOOD_ORDER = ["happy", "neutral", "bored", "tired", "anxious", "sad", "stressed"]
CATEGORIES = ["Food", "Shopping", "Transport", "Entertainment", "Health", "Education", "Other"]

PERSONALITY_PROFILES = {
    "Emotional Spender": {
        "description": "Your spending is heavily influenced by your emotions. You shop when stressed or sad.",
        "tip": "Try a 24-hour rule before making purchases when feeling emotional.",
        "emoji": "💭",
    },
    "Impulsive Buyer": {
        "description": "You make quick decisions and spend frequently on unplanned items.",
        "tip": "Make a shopping list before going out and stick to it strictly.",
        "emoji": "⚡",
    },
    "Controlled Spender": {
        "description": "You have strong financial discipline. Your spending is deliberate and planned.",
        "tip": "Great job! Consider investing your savings for compound growth.",
        "emoji": "🏆",
    },
    "Weekend Warrior": {
        "description": "You tend to binge spend on weekends while being frugal on weekdays.",
        "tip": "Set a weekend budget in advance to avoid overspending.",
        "emoji": "🎉",
    },
    "Category Addict": {
        "description": "You concentrate your spending heavily in one or two categories.",
        "tip": "Diversify your spending audit. What are you missing in other areas?",
        "emoji": "🎯",
    },
}


class SpendingPredictor:
    def __init__(self):
        self.lr_model = LogisticRegression(random_state=42)
        self.dt_model = DecisionTreeClassifier(max_depth=4, random_state=42)
        self.mood_encoder = LabelEncoder()
        self.mood_encoder.fit(MOOD_ORDER)
        self.trained = False

    def _encode_mood(self, mood: str) -> int:
        try:
            return self.mood_encoder.transform([mood.lower()])[0]
        except ValueError:
            return 3  # default: neutral

    def _build_features(self, expenses):
        """Build feature matrix from expense list."""
        X, y = [], []
        if len(expenses) < 5:
            return None, None

        avg_amount = np.mean([e["amount"] for e in expenses])

        for i, e in enumerate(expenses):
            mood_enc = self._encode_mood(e["mood"])
            is_weekend = int(e.get("is_weekend", False))
            amount = e["amount"]
            high_spend = int(amount > avg_amount * 1.3)

            # Simple time-of-day encoding (if available)
            try:
                hour = int(e.get("time", "12:00").split(":")[0])
            except Exception:
                hour = 12

            X.append([mood_enc, is_weekend, hour, amount])
            y.append(high_spend)

        return np.array(X), np.array(y)

    def train(self, expenses):
        """Train both models on historical data."""
        X, y = self._build_features(expenses)
        if X is None or len(set(y)) < 2:
            return  # Need variance in labels

        try:
            self.lr_model.fit(X, y)
            self.dt_model.fit(X, y)
            self.trained = True
        except Exception as e:
            print(f"Training error: {e}")

    def predict(self, mood: str, is_weekend: bool, hour: int, expenses: list) -> dict:
        """Predict overspending risk for given conditions."""
        if not self.trained:
            return {
                "risk": "unknown",
                "risk_score": 0.0,
                "message": "Model not trained yet.",
                "confidence": 0,
            }

        avg_amount = np.mean([e["amount"] for e in expenses]) if expenses else 500
        mood_enc = self._encode_mood(mood)
        features = np.array([[mood_enc, int(is_weekend), hour, avg_amount]])

        try:
            lr_prob = self.lr_model.predict_proba(features)[0][1]
            dt_prob = self.dt_model.predict_proba(features)[0][1]
            risk_score = (lr_prob * 0.5 + dt_prob * 0.5)
        except Exception:
            risk_score = 0.3

        if risk_score > 0.65:
            risk = "high"
            message = f"🚨 High overspending risk today! Feeling {mood} + {'weekend' if is_weekend else 'weekday'} is a dangerous combo for you."
        elif risk_score > 0.4:
            risk = "medium"
            message = f"⚠️ Moderate risk today. Stay mindful of your {mood} mood while spending."
        else:
            risk = "low"
            message = f"✅ Low risk today. You're in a good position to spend mindfully."

        return {
            "risk": risk,
            "risk_score": round(float(risk_score), 3),
            "message": message,
            "confidence": round(float(max(lr_prob if risk_score > 0.5 else 1 - lr_prob, 0.5) * 100), 1),
            "lr_score": round(float(lr_prob), 3),
            "dt_score": round(float(dt_prob), 3),
        }

    def analyze_personality(self, expenses: list) -> dict:
        """Classify money personality using rule-based heuristics."""
        if len(expenses) < 3:
            return {"personality": "Unknown", "description": "Add more expenses."}

        scores = {k: 0 for k in PERSONALITY_PROFILES}

        # Emotional spender: high spend when stressed/sad
        emotional_moods = {"stressed", "sad", "anxious"}
        emotional_expenses = [e for e in expenses if e["mood"] in emotional_moods]
        calm_expenses = [e for e in expenses if e["mood"] not in emotional_moods]

        if emotional_expenses and calm_expenses:
            emotional_avg = np.mean([e["amount"] for e in emotional_expenses])
            calm_avg = np.mean([e["amount"] for e in calm_expenses])
            if emotional_avg > calm_avg * 1.4:
                scores["Emotional Spender"] += 3

        # Impulsive: high frequency, short reasons
        short_reasons = sum(1 for e in expenses if len(e.get("reason", "")) < 10)
        if short_reasons / len(expenses) > 0.6:
            scores["Impulsive Buyer"] += 2

        # Weekend warrior
        weekend_exp = [e for e in expenses if e.get("is_weekend")]
        weekday_exp = [e for e in expenses if not e.get("is_weekend")]
        if weekend_exp and weekday_exp:
            weekend_avg = np.mean([e["amount"] for e in weekend_exp])
            weekday_avg = np.mean([e["amount"] for e in weekday_exp])
            if weekend_avg > weekday_avg * 1.5:
                scores["Weekend Warrior"] += 3

        # Category addict
        by_cat = {}
        for e in expenses:
            by_cat[e["category"]] = by_cat.get(e["category"], 0) + e["amount"]
        if by_cat:
            top_cat_share = max(by_cat.values()) / sum(by_cat.values())
            if top_cat_share > 0.6:
                scores["Category Addict"] += 3

        # Controlled: low variance, planned reasons
        amounts = [e["amount"] for e in expenses]
        if len(amounts) > 2:
            cv = np.std(amounts) / np.mean(amounts) if np.mean(amounts) > 0 else 1
            if cv < 0.4:
                scores["Controlled Spender"] += 4

        best = max(scores, key=scores.get)
        profile = PERSONALITY_PROFILES[best]

        return {
            "personality": best,
            "emoji": profile["emoji"],
            "description": profile["description"],
            "tip": profile["tip"],
            "scores": scores,
        }
