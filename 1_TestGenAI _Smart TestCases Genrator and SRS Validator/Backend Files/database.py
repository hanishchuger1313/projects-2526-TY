from pymongo import MongoClient
from datetime import datetime
from .config import settings

# MongoDB connection
MONGO_URI = settings.mongo_uri
client = MongoClient(MONGO_URI, maxPoolSize=50, connectTimeoutMS=30000)

# Database
db = client[settings.database_name]

# Collections
users_col = db["users"]
sessions_col = db["sessions"]
results_col = db["results"]
analytics_col = db["analytics"]
chats_col = db["chats"]
messages_col = db["messages"]
downloads_col = db["downloads"]

def create_indexes():
    """Create necessary database indexes for performance"""
    # Users collection indexes
    users_col.create_index("email", unique=True, name="email_unique")
    users_col.create_index("role", name="role_index")
    users_col.create_index("createdAt", name="created_at_index")
    
    # Sessions collection indexes
    sessions_col.create_index("userId", name="user_id_index")
    sessions_col.create_index("expiresAt", expireAfterSeconds=0, name="expiry_index")
    sessions_col.create_index([("userId", 1), ("createdAt", -1)], name="user_session_index")
    
    # Results collection indexes
    results_col.create_index("userId", name="results_user_id_index")
    results_col.create_index([("userId", 1), ("createdAt", -1)], name="user_results_date_index")
    results_col.create_index("type", name="type_index")
    
    # Analytics collection indexes
    analytics_col.create_index("userId", name="analytics_user_id_index")
    analytics_col.create_index([("action", 1), ("timestamp", -1)], name="action_timestamp_index")
    analytics_col.create_index("timestamp", expireAfterSeconds=30*24*60*60, name="analytics_ttl")  # 30 days TTL
    
    # Chats collection indexes
    chats_col.create_index("userId", name="chats_user_id_index")
    chats_col.create_index([("userId", 1), ("updatedAt", -1)], name="user_chats_date_index")
    
    # Messages collection indexes
    messages_col.create_index("chatId", name="messages_chat_id_index")
    messages_col.create_index([("chatId", 1), ("createdAt", 1)], name="chat_messages_chronological")
    
    # Downloads collection indexes
    downloads_col.create_index([("userId", 1), ("createdAt", -1)], name="user_downloads_index")
    
    print("Database indexes created successfully")

def get_database_stats():
    """Get database statistics"""
    stats = {
        "users": users_col.count_documents({}),
        "sessions": sessions_col.count_documents({}),
        "results": results_col.count_documents({}),
        "analytics": analytics_col.count_documents({}),
        "chats": chats_col.count_documents({}),
        "messages": messages_col.count_documents({}),
        "downloads": downloads_col.count_documents({}),
        "database": db.name,
        "timestamp": datetime.utcnow().isoformat()
    }
    return stats

def cleanup_old_sessions():
    """Cleanup expired sessions"""
    result = sessions_col.delete_many({"expiresAt": {"$lt": datetime.utcnow()}})
    return result.deleted_count

# Create indexes on startup
try:
    create_indexes()
    print("Database initialized successfully")
except Exception as e:
    print(f"Error creating database indexes: {e}")

# Test connection
try:
    client.server_info()
    print("MongoDB connection successful")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
