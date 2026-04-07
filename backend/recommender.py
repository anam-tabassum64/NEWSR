from typing import Dict, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class NewsRecommender:
    """
    Recommend similar articles using TF-IDF vectors built from the
    article title and description text.
    """

    def _article_text(self, article: Dict[str, str]) -> str:
        title = article.get("title") or ""
        description = article.get("description") or ""
        return f"{title} {description}".strip()

    def _same_article(self, first: Dict[str, str], second: Dict[str, str]) -> bool:
        first_url = first.get("url") or ""
        second_url = second.get("url") or ""

        if first_url and second_url and first_url == second_url:
            return True

        return (
            (first.get("title") or "") == (second.get("title") or "")
            and (first.get("description") or "") == (second.get("description") or "")
        )

    def _recommend_for_source(
        self, source_article: Dict[str, str], all_articles: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        if not source_article or not all_articles:
            return []

        documents = [self._article_text(article) for article in all_articles]
        source_text = self._article_text(source_article)

        if not source_text:
            return []

        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform([source_text] + documents)
        source_vector = tfidf_matrix[0:1]
        article_vectors = tfidf_matrix[1:]
        similarity_scores = cosine_similarity(source_vector, article_vectors).flatten()

        results = []

        for index, article in enumerate(all_articles):
            if self._same_article(source_article, article):
                continue

            article_with_meta = dict(article)
            article_with_meta["matchScore"] = max(
                0, min(100, int(round(float(similarity_scores[index]) * 100)))
            )
            article_with_meta["because_of"] = source_article.get("title") or "Your reading history"
            results.append(article_with_meta)

        results.sort(key=lambda item: item["matchScore"], reverse=True)
        return results

    def recommend(
        self,
        clicked: Dict[str, str],
        all_articles: List[Dict[str, str]],
        click_history: List[Dict[str, str]] | None = None,
    ) -> List[Dict[str, str]]:
        if not clicked or not all_articles:
            return []

        recent_history = (click_history or [])[-5:]
        source_articles = recent_history if recent_history else [clicked]

        deduplicated = {}

        for source_article in source_articles:
            recommendations = self._recommend_for_source(source_article, all_articles)

            for article in recommendations:
                article_url = article.get("url") or article.get("title") or ""
                existing = deduplicated.get(article_url)

                if existing is None or article["matchScore"] > existing["matchScore"]:
                    deduplicated[article_url] = article

        sorted_articles = sorted(
            deduplicated.values(), key=lambda item: item["matchScore"], reverse=True
        )
        return sorted_articles[:5]
