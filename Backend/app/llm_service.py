import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


client = OpenAI(
    api_key=os.getenv("GROK_API_KEY"),
    base_url=os.getenv("GROK_BASE_URL")
)

def classify_hunk(task_description: str, hunk_diff: str):
    prompt = f"""You are reviewing a code change.
Task the developer asked for: "{task_description}"

Here is one hunk of the diff:
{hunk_diff}

Classify this hunk as exactly one of: core_fix, unrelated_refactor, formatting, out_of_scope
Respond ONLY in this format:
label: <label>
reason: <one short sentence>
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}]
        )
        text = response.choices[0].message.content
    except Exception as e:
        return "unknown", f"Classification failed: {str(e)}"

    label = "unknown"
    reason = ""
    for line in text.splitlines():
        if line.startswith("label:"):
            label = line.split(":", 1)[1].strip()
        if line.startswith("reason:"):
            reason = line.split(":", 1)[1].strip()

    return label, reason