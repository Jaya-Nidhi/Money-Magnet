from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
def ask_ai(question, summary):
    prompt = f"""
    You are Money Magnet AI, a personal finance advisor.

    {summary}

    User question: {question}

    Give short, actionable advice (3-4 sentences max).
    """

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant"
    )

    return response.choices[0].message.content