Money Magnet AI

An intelligent expense tracking and analysis system that combines **Machine Learning + AI insights** to help users understand and control their spending behavior.

---

Features

 Smart Expense Tracking

* Log expenses with **amount, category, mood, and reason**
* Track emotional spending patterns
* Real-time dashboard with key metrics

 ML-Based Prediction

* Uses **Logistic Regression + Decision Tree**
* Predicts **overspending risk** based on:

  * Mood
  * Time of day
  * Weekend behavior
  * Historical spending

AI Insights (Groq-powered)

* Ask questions like:

  * *“Why do I overspend on weekends?”*
  * *“How can I control my spending?”*
* Provides **personalized financial advice**

 Personality Analysis

* Detects spending personality:

  * Emotional Spender
  * Impulsive Buyer
  * Controlled Spender
  * Weekend Warrior
* Gives actionable improvement tips

 Interactive Dashboard

* Category-wise spending breakdown
* Mood vs spending analysis
* Recent transactions view

---

##  Tech Stack

| Layer            | Technology            |
| ---------------- | --------------------- |
| Backend          | Flask                 |
| Frontend         | HTML, CSS, JavaScript |
| Machine Learning | Scikit-learn          |
| AI Integration   | Groq API              |
| Data Storage     | JSON                  |

---

 Project Structure
```
MoneyMag/
│
├── app.py                # Flask backend
├── models/
│   └── predictor.py      # ML model
├── ai/
│   └── groq_client.py   # AI integration
├── static/
│   ├── app.js           # Frontend logic
│   └── styles.css       # UI styling
├── templates/
│   └── index.html       # Main UI
├── data/
│   └── expenses.json    # Local storage
├── .env                 # API keys (not pushed)
└── requirements.txt
```

---

##  Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/MoneyMag.git
cd MoneyMag
```

### 2. Create virtual environment

```bash
python -m venv .venv
source .venv/bin/activate   # (Linux/Mac)
.venv\Scripts\activate      # (Windows)
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Add environment variables

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

---

### 5. Run the app

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000/
```

---

##  How It Works

### ML Model

* Trains on user expense data
* Learns spending patterns
* Predicts **risk of overspending**

### AI System

* Uses Groq LLM
* Takes:

  * User question
  * Spending summary
* Returns:

  * Personalized advice
  * Behavioral insights

---

##  Security Note

* API keys are stored in `.env`
* `.env` is excluded via `.gitignore`
* Never commit sensitive credentials

---

## 🎯 Future Improvements

* Database integration (PostgreSQL / MongoDB)
* User authentication system
* Advanced visualizations (charts, graphs)
* Mobile responsive UI
* Deployment (Render / AWS / Vercel)

---

 Inspiration

This project was built to explore how **AI + behavioral finance** can help people make smarter financial decisions.

-
