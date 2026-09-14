from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.review.router import router as review_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router)