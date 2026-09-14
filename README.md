# Hunk Review Tool

An AI-powered code review tool that classifies git diff hunks by intent 
(core fix, unrelated refactor, formatting, out of scope) and lets you 
selectively revert unwanted changes — individually or by category.

## The Problem

AI coding agents often make more changes than you asked for — mixing 
in unrelated refactors, formatting changes, or scope creep alongside 
the actual fix. Reviewing and manually undoing just the unwanted parts 
of a large diff is tedious.

## What It Does

1. Analyzes a git diff (unstaged, staged, or last commit)
2. Classifies each hunk using an LLM (Groq)
3. Lets you revert individual hunks or entire categories at once
4. Persists review history in Postgres

## Tech Stack

- Backend: FastAPI, SQLModel, PostgreSQL, GitPython
- Frontend: React (Vite), Tailwind CSS
- LLM: Groq (Llama models)
- Containerized with Docker Compose

## Running Locally

Requires Docker Desktop and a free Groq API key.

1. Clone this repo
2. Create a `.env` file in the project root:
GROK_API_KEY=your_key
GROK_BASE_URL=https://api.groq.com/openai/v1

3. Run:
docker compose up --build

4. Open http://localhost:5173

**Note**: this tool reviews repos on your local filesystem — point it 
at any git repo path on your machine.

