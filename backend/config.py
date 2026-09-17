import os

from dotenv import load_dotenv

load_dotenv()


JWT_SECRET = os.environ.get("JWT_SECRET", "dev-only-change-this-secret-please-set-a-real-secret")
MONGO_URI = os.environ.get("MONGO_URI", "")
MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "newspulse")
JWT_EXPIRES_HOURS = int(os.environ.get("JWT_EXPIRES_HOURS", "24"))
NEWS_CACHE_SECONDS = int(os.environ.get("NEWS_CACHE_SECONDS", "300"))
MAX_PDF_BYTES = int(os.environ.get("MAX_PDF_BYTES", str(50 * 1024 * 1024)))
NEWSDATA_API_KEY = os.environ.get("NEWSDATA_API_KEY", "YOUR_NEWSDATA_API_KEY")
CURRENTS_API_KEY = os.environ.get("CURRENTS_API_KEY", "YOUR_CURRENTS_API_KEY")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
STORY_SIMILARITY_THRESHOLD = float(os.environ.get("STORY_SIMILARITY_THRESHOLD", "0.72"))
STORY_TITLE_THRESHOLD = float(os.environ.get("STORY_TITLE_THRESHOLD", "0.5"))
INTERACTION_WEIGHTS = {
	"bookmark": float(os.environ.get("WEIGHT_BOOKMARK", "5")),
	"long_read": float(os.environ.get("WEIGHT_LONG_READ", "4")),
	"click": float(os.environ.get("WEIGHT_CLICK", "2")),
	"search": float(os.environ.get("WEIGHT_SEARCH", "3")),
	"category_view": float(os.environ.get("WEIGHT_CATEGORY_VIEW", "1")),
	"skip": float(os.environ.get("WEIGHT_SKIP", "-1")),
}
RECOMMENDATION_WEIGHTS = {
	"content": float(os.environ.get("RECOMMEND_CONTENT_WEIGHT", "0.45")),
	"interest": float(os.environ.get("RECOMMEND_INTEREST_WEIGHT", "0.25")),
	"behavior": float(os.environ.get("RECOMMEND_BEHAVIOR_WEIGHT", "0.15")),
	"trending": float(os.environ.get("RECOMMEND_TRENDING_WEIGHT", "0.10")),
	"recency": float(os.environ.get("RECOMMEND_RECENCY_WEIGHT", "0.05")),
}