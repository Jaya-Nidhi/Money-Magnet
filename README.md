# 💰 Money Magnet AI

> An AI-powered personal finance tracker that analyzes **spending behavior + emotions** to generate deep financial insights.

Not just *"where money goes"* — but **"why you spend"**.

---

## 🚀 Features

### ✅ V1 — Core (Built)
| Feature | Description |
|---|---|
| **Expense Logging** | Amount, Category, Mood, Reason, Date |
| **Dashboard** | Total spend, category breakdown, mood vs spending |
| **Visual Charts** | Bar charts for categories + moods |
| **AI Insights** | Pattern detection (stress-spend, weekend surge) |
| **Money Personality** | Emotional / Impulsive / Controlled / Weekend Warrior |
| **Local Fallback** | Works offline with localStorage |

### 🟡 V2 — ML Predictions (Built)
| Feature | Description |
|---|---|
| **Overspending Predictor** | Logistic Regression + Decision Tree ensemble |
| **Risk Score** | 0–100 score with confidence level |
| **Mood-Day Analysis** | Weekday vs Weekend spending patterns |
| **Smart Alerts** | "High risk to overspend today" |

### 🔴 V3 — Advanced AI (Partial)
| Feature | Status |
|---|---|
| 💬 Ask Claude | ✅ Integrated via Anthropic API |
| 🧬 Money Personality | ✅ 5 personality types |
| 📊 Weekly Reports | 🚧 Coming |
| 🔮 Lucky Spending Days | 🚧 Coming |

---

## 🛠️ Tech Stack

```
Frontend:  HTML5 · CSS3 · Vanilla JS
Backend:   Python · Flask · Flask-CORS
ML:        scikit-learn (Logistic Regression + Decision Tree)
AI:        Anthropic Claude API
Storage:   JSON file (backend) / localStorage (offline)
```

---

## 📁 Project Structure

```
money-magnet-ai/
├── README.md
├── .gitignore
│
├── frontend/
│   ├── index.html          # Main app UI
│   ├── styles.css          # Full design system
│   └── app.js              # App logic + API calls
│
└── backend/
    ├── app.py              # Flask REST API
    ├── requirements.txt    # Python dependencies
    ├── data/
    │   └── expenses.json   # Expense storage
    └── models/
        ├── __init__.py
        └── predictor.py    # scikit-learn ML models
```

---

## ⚡ Quick Start

### Option A — Frontend Only (No backend needed)
Just open `frontend/index.html` in your browser. Data saves to `localStorage`. AI insights require Anthropic API key.

### Option B — Full Stack

#### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/money-magnet-ai.git
cd money-magnet-ai
```

#### 2. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Add your Anthropic API key (for AI Chat)
```bash
# Create .env in backend/
echo "ANTHROPIC_API_KEY=your_key_here" > .env
```

#### 4. Run the backend
```bash
python app.py
# Server starts on http://localhost:5000
```

#### 5. Open the frontend
Open `frontend/index.html` in your browser (or use Live Server in VS Code).

---

## 🤖 ML Models

### Logistic Regression
- **Task**: Binary classification — high vs low spending probability
- **Features**: Mood (encoded), is_weekend, hour_of_day, amount
- **Output**: Probability score 0–1

### Decision Tree (max_depth=4)
- **Task**: Captures non-linear patterns (e.g., "stressed + weekend = danger")
- **Ensemble**: Average of LR + DT scores for final prediction
- **Retrains**: Automatically after each new expense

### Money Personality Detection
- **Method**: Rule-based heuristics on spending variance, mood correlation, category concentration, weekend patterns
- **Types**: Emotional Spender · Impulsive Buyer · Controlled · Weekend Warrior · Category Addict

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary Green | `#16A34A` | CTA, active states, money indicators |
| Dark Background | `#0F172A` | Main app background |
| Card Background | `#1E293B` | Panels, cards |
| Accent Gold | `#FACC15` | Mood badges, highlights |
| Light Text | `#E2E8F0` | Primary text |
| Muted Text | `#94A3B8` | Labels, metadata |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add new expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/stats` | Aggregated statistics |
| POST | `/api/predict` | Run ML prediction |
| GET | `/api/personality` | Get money personality |
| GET | `/api/insights` | Pattern-based insights |
| GET | `/api/health` | Health check |

### POST `/api/expenses` body
```json
{
  "amount": 450.00,
  "category": "Food",
  "mood": "stressed",
  "reason": "Ordered food because too tired to cook",
  "date": "2025-04-10"
}
```

### POST `/api/predict` body
```json
{ "mood": "stressed" }
```

---

## 🗺️ Roadmap

- [ ] Weekly PDF reports
- [ ] Monthly budget goals + alerts
- [ ] WhatsApp/Telegram bot integration
- [ ] Mobile app (React Native)
- [ ] Multi-user with auth
- [ ] Bank statement import (CSV/PDF)
- [ ] Lucky spending day predictor
- [ ] Savings rate tracker

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with 💚 + AI · Track smart, spend smarter</p>
