from together import Together
from app.config import settings

# ✅ use key from .env
client = Together(api_key=settings.openai_api_key)


# 🔥 AI SUGGESTIONS (ADD THIS)
def get_ai_suggestions(prompt):
    try:
        response = client.chat.completions.create(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages=[
                {"role": "user", "content": f"Analyze this SRS and give improvement suggestions:\n{prompt}"}
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"


# 🔥 AI TESTCASES (ALREADY THERE)
def get_ai_testcases(prompt):
    try:
        response = client.chat.completions.create(
            model="mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages=[
                {"role": "user", "content": f"Generate detailed software test cases in table format:\n{prompt}"}
            ]
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Error: {str(e)}"