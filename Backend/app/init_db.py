import asyncio
from app.database.main import init_db

asyncio.run(init_db())