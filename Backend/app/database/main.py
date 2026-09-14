from sqlmodel import create_engine, text,SQLModel
from sqlalchemy.ext.asyncio import AsyncEngine
from app.config import settings
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from app.database.models import ReviewSession, Hunk  # noqa: F401 — needed to register tables



engine=AsyncEngine(
    create_engine(
    url=settings.DATABASE_URL,
    echo=True
))

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all,checkfirst=True)


async def get_session():
    Session=sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with Session() as session:
        yield session
