from pymongo import MongoClient
from config.config import MONGO_URI

class DB:
    def __init__(self):
        self.db=None

    def connect_db(self):
        try:
            self.client = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=5000
            )

            self.client.admin.command("ping")
            self.db = self.client.get_default_database()
            if self.db is None:
                raise ValueError("Database name missing from URI")
            print("✅ Database Connected successfully...")
            return self.db
        
        except Exception as e:
            print(f"❌ Database Connections Error: {e}")


    def get_collection(self,name: str):
        return self.db[name]