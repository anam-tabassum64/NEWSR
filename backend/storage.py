from datetime import datetime, timezone

from config import MONGO_DB_NAME, MONGO_URI

try:
    from pymongo import ASCENDING, DESCENDING, MongoClient
except ImportError:
    ASCENDING = DESCENDING = MongoClient = None


class Storage:
    """Persistence boundary with MongoDB and an explicit local demo fallback."""

    def __init__(self):
        self.mode = "memory"
        self.client = None
        self.db = None
        self.users = {}
        self.tokens = {}
        self.interactions = []
        self.articles = {}
        self.bookmarks = []
        self.reading_history = []
        self._connect()

    def _connect(self):
        if not MONGO_URI or MongoClient is None:
            return
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            client.admin.command("ping")
            self.client = client
            self.db = client[MONGO_DB_NAME]
            self.db.users.create_index("email", unique=True)
            self.db.preferences.create_index("user_id", unique=True)
            self.db.interactions.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
            self.db.articles.create_index("url", unique=True)
            self.db.story_groups.create_index("story_id", unique=True)
            self.db.recommendations.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
            self.db.bookmarks.create_index([("user_id", ASCENDING), ("url", ASCENDING)], unique=True)
            self.db.reading_history.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
            self.mode = "mongo"
        except Exception:
            self.client = None
            self.db = None

    @property
    def is_persistent(self):
        return self.mode == "mongo"

    def get_user(self, email):
        if not self.is_persistent:
            return self.users.get(email)
        user = self.db.users.find_one({"email": email})
        if user:
            preferences = self.db.preferences.find_one({"user_id": email}, {"_id": 0})
            if preferences:
                preferences.pop("user_id", None)
                user["preferences"] = preferences
            user.pop("_id", None)
        return user

    def create_user(self, user):
        if self.is_persistent:
            user_document = dict(user)
            preferences = user_document.pop("preferences", {})
            self.db.users.insert_one(user_document)
            self.db.preferences.insert_one({"user_id": user["email"], **preferences})
        else:
            self.users[user["email"]] = user

    def update_user(self, email, changes):
        if self.is_persistent:
            user_changes = dict(changes)
            preferences = user_changes.pop("preferences", None)
            if user_changes:
                self.db.users.update_one({"email": email}, {"$set": user_changes})
            if preferences is not None:
                self.db.preferences.update_one(
                    {"user_id": email},
                    {"$set": {"user_id": email, **preferences}},
                    upsert=True,
                )
            return self.get_user(email)
        self.users[email].update(changes)
        return self.users[email]

    def save_interaction(self, interaction):
        if self.is_persistent:
            self.db.interactions.insert_one(dict(interaction))
        else:
            self.interactions.append(dict(interaction))
        user_id = interaction.get("user_id")
        if not user_id or user_id == "anonymous":
            return
        if interaction.get("action") == "bookmark":
            bookmark = dict(interaction)
            bookmark["saved_at"] = interaction.get("timestamp")
            if self.is_persistent:
                self.db.bookmarks.update_one(
                    {"user_id": user_id, "url": interaction.get("url")},
                    {"$set": bookmark},
                    upsert=True,
                )
            else:
                self.bookmarks = [item for item in self.bookmarks if item.get("url") != interaction.get("url") or item.get("user_id") != user_id]
                self.bookmarks.append(bookmark)
        elif interaction.get("action") == "click":
            if self.is_persistent:
                self.db.reading_history.insert_one(dict(interaction))
            else:
                self.reading_history.append(dict(interaction))

    def get_bookmarks(self, user_id, limit=100):
        if self.is_persistent:
            values = list(self.db.bookmarks.find({"user_id": user_id}).sort("saved_at", DESCENDING).limit(limit))
            for value in values:
                value.pop("_id", None)
            return values
        return list(reversed([item for item in self.bookmarks if item.get("user_id") == user_id][-limit:]))

    def get_reading_history(self, user_id, limit=100):
        if self.is_persistent:
            values = list(self.db.reading_history.find({"user_id": user_id}).sort("timestamp", DESCENDING).limit(limit))
            for value in values:
                value.pop("_id", None)
            return values
        return list(reversed([item for item in self.reading_history if item.get("user_id") == user_id][-limit:]))

    def get_interactions(self, user_id=None, limit=100):
        if self.is_persistent:
            query = {"user_id": user_id} if user_id else {}
            values = list(self.db.interactions.find(query).sort("timestamp", DESCENDING).limit(limit))
            for value in values:
                value.pop("_id", None)
            return values
        values = [item for item in self.interactions if not user_id or item.get("user_id") == user_id]
        return list(reversed(values[-limit:]))

    def save_article(self, article):
        url = article.get("url")
        if not url:
            return
        if self.is_persistent:
            self.db.articles.update_one({"url": url}, {"$set": dict(article)}, upsert=True)
            if article.get("story_id"):
                self.db.story_groups.update_one(
                    {"story_id": article["story_id"]},
                    {"$set": {
                        "story_id": article["story_id"],
                        "title": article.get("title", ""),
                        "sources": article.get("covered_by", []),
                        "updated_at": article.get("publishedAt"),
                    }},
                    upsert=True,
                )
        else:
            self.articles[url] = dict(article)

    def save_recommendations(self, user_id, recommendations):
        if not self.is_persistent or not user_id or not recommendations:
            return
        self.db.recommendations.insert_one({
            "user_id": user_id,
            "recommendations": list(recommendations),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    def list_articles(self, limit=200):
        if self.is_persistent:
            values = list(self.db.articles.find().limit(limit))
            for value in values:
                value.pop("_id", None)
            return values
        return list(self.articles.values())[:limit]

    def revoke_token(self, token, expires_at):
        self.tokens[token] = expires_at

    def is_token_revoked(self, token):
        expires_at = self.tokens.get(token)
        if not expires_at:
            return False
        if expires_at < datetime.now(timezone.utc).timestamp():
            self.tokens.pop(token, None)
            return False
        return True


storage = Storage()