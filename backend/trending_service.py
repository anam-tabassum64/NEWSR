import math
from collections import defaultdict
from datetime import datetime, timezone

from storage import storage


def _age_days(value):
    try:
        timestamp = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        return max(0, (datetime.now(timezone.utc) - timestamp).total_seconds() / 86400)
    except (TypeError, ValueError):
        return 30


def get_trending_stories(limit=10):
    groups = defaultdict(lambda: {"count": 0, "topics": set(), "sources": set(), "title": "", "latest": 0})
    for interaction in storage.get_interactions(limit=1000):
        key = interaction.get("story_id") or interaction.get("url") or interaction.get("article_id")
        if not key:
            continue
        group = groups[key]
        weight = 2 if interaction.get("action") == "click" else 1
        recency = math.exp(-_age_days(interaction.get("timestamp")) / 7)
        group["count"] += weight
        group["latest"] = max(group["latest"], recency)
        if interaction.get("topic"):
            group["topics"].add(interaction["topic"])
        if interaction.get("source"):
            group["sources"].add(interaction["source"])
        group["title"] = group["title"] or interaction.get("title", "")

    results = []
    for story_id, group in groups.items():
        score = group["count"] * (0.7 + 0.3 * group["latest"]) + min(len(group["sources"]), 5) * 0.5
        results.append({
            "story_id": story_id,
            "topic": sorted(group["topics"])[0] if group["topics"] else "all",
            "count": group["count"],
            "sources": sorted(group["sources"]),
            "title": group["title"],
            "score": round(score, 2),
        })
    return sorted(results, key=lambda item: item["score"], reverse=True)[:limit]