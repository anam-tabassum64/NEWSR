import math
from datetime import datetime, timezone

from config import RECOMMENDATION_WEIGHTS
from recommender import NewsRecommender
from storage import storage
from trending_service import get_trending_stories
from user_profile import build_interest_profile


class HybridRecommendationService:
    def __init__(self):
        self.content = NewsRecommender()

    def recommend(self, clicked, articles, history=None, user_id=None):
        candidates = self.content.recommend(clicked, articles, history or [])
        profile = build_interest_profile(user_id) if user_id else {}
        interactions = storage.get_interactions(user_id, 500) if user_id else []
        consumed = {item.get("url") or item.get("article_id") for item in (history or [])}
        consumed.update(item.get("url") or item.get("article_id") for item in interactions if item.get("action") == "click")
        trending = {item.get("story_id"): item for item in get_trending_stories(100)}
        max_trending = max((item.get("score", 0) for item in trending.values()), default=1)
        ranked = []
        for article in candidates:
            topic = (article.get("category") or article.get("topic") or "").lower()
            interest = profile.get(topic, 0)
            content = article.get("matchScore", 0) / 100
            behavior = self._behavior_score(article, interactions)
            trend = trending.get(article.get("story_id"), {})
            trending_score = trend.get("score", 0) / max_trending
            recency = self._recency_score(article.get("publishedAt") or article.get("published_at"))
            score = (
                content * RECOMMENDATION_WEIGHTS["content"]
                + interest * RECOMMENDATION_WEIGHTS["interest"]
                + behavior * RECOMMENDATION_WEIGHTS["behavior"]
                + trending_score * RECOMMENDATION_WEIGHTS["trending"]
                + recency * RECOMMENDATION_WEIGHTS["recency"]
            )
            already_consumed = article.get("url") in consumed or article.get("id") in consumed
            if already_consumed:
                score *= 0.2
            article["matchScore"] = round(score * 100)
            article["why_this"] = self._explanation(
                topic, profile, article.get("because_of"), behavior, trending_score, recency, already_consumed
            )
            article["because_of"] = article["why_this"]
            article["signals"] = {
                "content_similarity": round(content, 3),
                "interest": round(interest, 3),
                "behavior": round(behavior, 3),
                "trending": round(trending_score, 3),
                "recency": round(recency, 3),
            }
            ranked.append(article)
        ranked.sort(key=lambda item: item["matchScore"], reverse=True)
        return ranked[:5]

    @staticmethod
    @staticmethod
    def _behavior_score(article, interactions):
        if not interactions:
            return 0
        topic = (article.get("category") or article.get("topic") or "").lower()
        matching = [item for item in interactions if (item.get("topic") or item.get("category") or "").lower() == topic]
        return min(1, len(matching) / 5)

    @staticmethod
    def _recency_score(value):
        try:
            published = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            age_days = max(0, (datetime.now(timezone.utc) - published).total_seconds() / 86400)
            return math.exp(-age_days / 7)
        except (TypeError, ValueError):
            return 0

    @staticmethod
    def _explanation(topic, profile, source_title, behavior, trending_score, recency, already_consumed):
        if already_consumed:
            return "Shown with a lower priority because you already read it."
        reasons = []
        if topic and profile.get(topic, 0) >= 0.5:
            reasons.append(f"you frequently read {topic} stories")
        if behavior >= 0.4:
            reasons.append(f"your recent {topic} reading activity")
        if trending_score >= 0.5:
            reasons.append("it is popular among recent readers")
        if reasons:
            return "Because " + " and ".join(reasons) + "."
        if source_title:
            return f"Similar to an article you recently read: {source_title}"
        if recency >= 0.5:
            return "A recent story related to your current reading."
        return "Similar to your recent reading."


recommendation_service = HybridRecommendationService()