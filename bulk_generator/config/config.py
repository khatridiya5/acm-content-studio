import os,re
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]

ENV = os.getenv("APP_ENV", "development")

env_file = BASE_DIR / (
    ".env.development" if ENV == "development" else ".env"
)

load_dotenv(env_file)

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

if not MONGO_URI:
    raise ValueError(f"MONGO_URI not configured in {env_file}")