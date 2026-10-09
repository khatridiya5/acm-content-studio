import argparse
import csv
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

# Add server root directory to sys.path to allow imports from model/
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from model.member import Member


def get_csv_path(custom_path: str | None = None) -> Path:
    """Find details.csv or detail.csv in data/ or at custom path."""
    if custom_path:
        p = Path(custom_path)
        if p.exists():
            return p
        raise FileNotFoundError(f"Specified CSV path does not exist: {custom_path}")

    candidates = [
        BASE_DIR / "data" / "details.csv",
        BASE_DIR / "data" / "detail.csv",
        BASE_DIR / "details.csv",
        BASE_DIR / "detail.csv",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError(f"Could not find details.csv or detail.csv in {BASE_DIR / 'data'}")


def seed_members(csv_path: Path | None = None, drop_existing: bool = False):
    """Seed members collection from CSV file into MongoDB."""
    # Load environment variables
    load_dotenv(BASE_DIR / ".env.development")
    load_dotenv(BASE_DIR / ".env")

    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/ACM_Content_Marketing")
    target_csv = csv_path or get_csv_path()

    print(f"Connecting to MongoDB at: {mongo_uri}")
    client = MongoClient(mongo_uri)

    # Resolve database: default database from URI, or fallback to ACM_Content_Marketing
    try:
        db = client.get_default_database()
        if db is None:
            db = client["ACM_Content_Marketing"]
    except Exception:
        db = client["ACM_Content_Marketing"]

    collection = db["members"]

    if drop_existing:
        print("Dropping existing 'members' collection...")
        collection.drop()

    # Ensure unique index on roll_no
    collection.create_index("roll_no", unique=True)

    print(f"Reading member records from: {target_csv}")
    seeded_count = 0
    updated_count = 0

    # Using utf-8-sig to handle optional UTF-8 BOM
    with open(target_csv, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row_num, raw_row in enumerate(reader, start=1):
            row = {k.strip(): v.strip() for k, v in raw_row.items() if k}

            try:
                # Validate using Pydantic model
                member = Member(**row)
            except Exception as err:
                print(f"Row {row_num} validation failed: {err} | Data: {row}")
                continue

            doc = member.model_dump(exclude={"id"})

            # Upsert by roll_no
            result = collection.update_one(
                {"roll_no": doc["roll_no"]},
                {"$set": doc},
                upsert=True,
            )

            if result.upserted_id:
                seeded_count += 1
                print(f"  [+] Inserted: {doc['name']} ({doc['roll_no']}) - {doc['position']}")
            elif result.modified_count > 0:
                updated_count += 1
                print(f"  [~] Updated:  {doc['name']} ({doc['roll_no']}) - {doc['position']}")
            else:
                print(f"  [=] Unchanged: {doc['name']} ({doc['roll_no']})")

    total_in_db = collection.count_documents({})
    print("\n--- Seeding Complete ---")
    print(f"Newly inserted: {seeded_count}")
    print(f"Updated:        {updated_count}")
    print(f"Total members:  {total_in_db}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed MongoDB members collection from CSV")
    parser.add_argument("--csv", type=str, default=None, help="Path to CSV file (default: data/details.csv)")
    parser.add_argument("--drop", action="store_true", help="Drop existing members collection before seeding")
    args = parser.parse_args()

    csv_file = Path(args.csv) if args.csv else None
    seed_members(csv_path=csv_file, drop_existing=args.drop)
