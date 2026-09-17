import math
from collections import defaultdict
from datetime import datetime, timezone

from storage import storage
from config import INTERACTION_WEIGHTS


ACTION_WEIGHTS = INTERACTION_WEIGHTS


def _timestamp(value):
    if isinstance(value, datetime):
        return value.timestamp()
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00")).timestamp()
    except (TypeError, ValueError):
        return datetime.now(timezone.utc).timestamp()


def build_interest_profile(user_id=None, interactions=None):
    interactions = interactions if interactions is not None else storage.get_interactions(user_id, 250)
    scores = defaultdict(float)
    now = datetime.now(timezone.utc).timestamp()

    for interaction in interactions:
        topic = (interaction.get("topic") or interaction.get("category") or "all").lower()
        action = interaction.get("action", "click")
        weight = ACTION_WEIGHTS.get(action, 0)
        duration = float(interaction.get("duration_seconds") or 0)
        if action in {"click", "reading_complete"} and duration >= 30:
            weight += ACTION_WEIGHTS["long_read"]
        age_days = max(0, (now - _timestamp(interaction.get("timestamp"))) / 86400)
        scores[topic] += weight * math.exp(-age_days / 30)

    positive = {topic: max(0, value) for topic, value in scores.items()}
    maximum = max(positive.values(), default=0)
    if not maximum:
        return {}
    return {topic: round(value / maximum, 3) for topic, value in sorted(positive.items(), key=lambda item: item[1], reverse=True)}


def analytics_for_user(user_id):
    interactions = storage.get_interactions(user_id, 1000)
    saved_bookmarks = storage.get_bookmarks(user_id, 1000)
    topics = defaultdict(int)
    total_seconds = 0
    bookmarks = 0
    for item in interactions:
        topic = (item.get("topic") or item.get("category") or "all").lower()
        topics[topic] += 1
        total_seconds += int(item.get("duration_seconds") or 0)
    bookmarks = len(saved_bookmarks)
    interest_profile = build_interest_profile(user_id, interactions)
    return {
        "articles_read": len({item.get("article_id") or item.get("url") for item in interactions if item.get("action") in {"click", "reading_complete"}}),
        "bookmarks": bookmarks,
        "total_reading_seconds": total_seconds,
        "topics_explored": len(topics),
        "most_read_topics": [{"topic": topic, "count": count} for topic, count in sorted(topics.items(), key=lambda item: item[1], reverse=True)[:6]],
        "interest_profile": interest_profile,
        "interest_breakdown": [{"topic": topic, "score": score} for topic, score in interest_profile.items()],
        "recent_activity": interactions[:10],
    }