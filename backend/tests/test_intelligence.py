import sys
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app
from story_detector import group_stories


def test_story_detector_groups_paraphrases_without_merging_unrelated_articles():
    grouped = group_stories([
        {"title": "OpenAI launches a new AI model", "description": "A new model was released", "source": "A"},
        {"title": "New artificial intelligence model unveiled by OpenAI", "description": "OpenAI released a model", "source": "B"},
        {"title": "Local team wins championship", "description": "Sports result", "source": "C"},
    ])
    assert grouped[0]["story_id"] == grouped[1]["story_id"]
    assert grouped[0]["covered_by"] == ["A", "B"]
    assert grouped[2]["story_id"] != grouped[0]["story_id"]


def test_news_fallback_returns_normalized_articles():
    response = app.test_client().get("/news?topic=ai&page=1")
    assert response.status_code == 200
    assert response.json
    assert {"title", "description", "url", "source", "story_id", "covered_by"}.issubset(response.json[0])


def test_authentication_requires_valid_password_and_returns_jwt():
    client = app.test_client()
    assert client.post("/auth/register", json={"name": "Test", "email": "bad", "password": "short"}).status_code == 400
    response = client.post("/auth/register", json={"name": "Test", "email": "ci@example.com", "password": "StrongPass1"})
    assert response.status_code in {201, 409}
    if response.status_code == 201:
        token = response.json["token"]
        assert client.get("/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code == 200


def test_protected_routes_reject_missing_credentials():
    client = app.test_client()
    assert client.get("/analytics").status_code == 401
    assert client.get("/briefing").status_code == 401
    assert client.get("/bookmarks").status_code == 401


def test_reading_tracking_and_article_tools_validate_input():
    client = app.test_client()
    article = {"title": "AI story", "description": "A useful description", "url": "https://example.test/story"}
    assert client.post("/track_reading", json={"article": article, "topic": "ai", "duration_seconds": "bad"}).status_code == 400
    reading = client.post("/track_reading", json={"article": article, "topic": "ai", "duration_seconds": 40})
    assert reading.status_code == 201
    tools = client.post("/article-tools", json={"article": article})
    assert tools.status_code == 200
    assert {"summary", "key_facts", "explain_simply", "why_it_matters"}.issubset(tools.json)


def test_news_rejects_malformed_page_and_pdf_signature():
    client = app.test_client()
    assert client.get("/news?topic=ai&page=bad").status_code == 400
    response = client.post(
        "/summarize",
        data={"file": (BytesIO(b"not a pdf"), "story.pdf")},
        content_type="multipart/form-data",
    )
    assert response.status_code == 400