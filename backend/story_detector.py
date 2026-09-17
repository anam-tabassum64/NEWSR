import re
from collections import OrderedDict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _text(article):
    value = f"{article.get('title', '')} {article.get('description', '')}".lower()
    value = value.replace("artificial intelligence", "ai")
    return re.sub(r"[^a-z0-9\s]", " ", value)


def _title_tokens(article):
    return set(_text({"title": article.get("title", "")}).split())


def group_stories(articles, threshold=0.72, title_threshold=0.5):
    """Group likely duplicate coverage without asserting that stories are true."""
    if not articles:
        return []
    documents = [_text(article) for article in articles]
    matrix = TfidfVectorizer(stop_words="english").fit_transform(documents)
    title_matrix = TfidfVectorizer(stop_words="english").fit_transform(
        [_text({"title": article.get("title", "")}) for article in articles]
    )
    groups = []
    assigned = {}
    for index, article in enumerate(articles):
        group_index = None
        for candidate in range(index):
            similarity = cosine_similarity(matrix[index], matrix[candidate])[0][0]
            title_similarity = cosine_similarity(title_matrix[index], title_matrix[candidate])[0][0]
            shared = _title_tokens(article) & _title_tokens(articles[candidate])
            union = _title_tokens(article) | _title_tokens(articles[candidate])
            token_overlap = len(shared) / len(union) if union else 0
            if similarity >= threshold or (title_similarity >= title_threshold and len(shared) >= 2) or (len(shared) >= 2 and token_overlap >= 0.35):
                group_index = assigned[candidate]
                break
        if group_index is None:
            group_index = len(groups)
            groups.append([])
        assigned[index] = group_index
        groups[group_index].append(index)

    result = []
    for group_index, indexes in enumerate(groups, start=1):
        sources = list(OrderedDict.fromkeys(articles[index].get("source", "Unknown source") for index in indexes))
        story_id = f"story-{group_index}"
        for index in indexes:
            article = dict(articles[index])
            article["story_id"] = story_id
            article["covered_by"] = sources
            result.append(article)
    return result