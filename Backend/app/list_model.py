from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("GROK_API_KEY"), base_url=os.getenv("GROK_BASE_URL"))

models = client.models.list()
for m in models.data:
    print(m.id)