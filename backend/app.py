# FILE: backend/app.py
import os
import re
import hashlib
import time
from collections import Counter
from datetime import datetime
from email.utils import parsedate_to_datetime
from html import unescape
from urllib.parse import quote_plus
from xml.etree import ElementTree

import requests
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_mail import Mail

from config import (
    CORS_ORIGINS,
    CURRENTS_API_KEY,
    JWT_SECRET,
    MAX_PDF_BYTES,
    NEWS_CACHE_SECONDS,
    NEWSDATA_API_KEY,
    STORY_SIMILARITY_THRESHOLD,
    STORY_TITLE_THRESHOLD,
)

from auth import (
    forgot_password,
    get_current_user,
    login_with_google,
    login_user,
    logout_user,
    register_user,
    reset_password,
    require_auth,
    update_preferences,
    verify_token,
)
from pdf_extractor import (
    detect_topics_from_text,
    extract_headlines_from_text,
    extract_text_from_pdf,
    generate_article_tools,
    generate_summary_from_text,
)
from recommender import NewsRecommender
from recommendation_service import recommendation_service
from storage import storage
from story_detector import group_stories
from trending_service import get_trending_stories
from user_profile import analytics_for_user, build_interest_profile


app = Flask(__name__)
CORS(app, origins=CORS_ORIGINS)
app.config["JWT_SECRET"] = JWT_SECRET
app.config["MAX_CONTENT_LENGTH"] = MAX_PDF_BYTES
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME", "")
app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD", "")
app.config["MAIL_DEFAULT_SENDER"] = (
    "NewsPulse",
    os.environ.get("MAIL_USERNAME", "your@gmail.com"),
)
mail = Mail(app)


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return response

NEWSDATA_URL = "https://newsdata.io/api/1/latest"
CURRENTS_SEARCH_URL = "https://api.currentsapi.services/v1/search"
GOOGLE_RSS_URL = "https://news.google.com/rss/search"
PAGE_SIZE = 18
RSS_ITEMS_PER_QUERY = 30

TOPIC_QUERY_MAP = {
    "all": "latest news",
    "ai": "artificial intelligence",
    "technology": "technology",
    "business": "business",
    "startups": "startups",
    "politics": "politics",
    "world": "world news",
    "crypto": "cryptocurrency",
    "sports": "sports",
    "science": "science",
    "health": "health",
}

TOPIC_RSS_QUERIES = {
    "all": ["latest news", "breaking news", "world headlines"],
    "ai": ["artificial intelligence", "AI tools", "machine learning"],
    "technology": ["technology", "software", "cybersecurity"],
    "business": ["business", "markets", "startups"],
    "startups": ["startups", "venture capital", "founder news"],
    "politics": ["politics", "government policy", "election news"],
    "world": ["world news", "global affairs", "international headlines"],
    "crypto": ["cryptocurrency", "bitcoin", "blockchain"],
    "sports": ["sports", "football", "cricket"],
    "science": ["science", "research", "space exploration"],
    "health": ["health", "public health", "medical research"],
}

PUBLISHER_SEARCH_DOMAINS = {
    "NewsPulse Desk": "news.google.com",
    "NEWSR Desk": "news.google.com",
    "Digital Daily": "www.theverge.com",
    "Signal Watch": "www.reuters.com",
    "Morning Scope": "apnews.com",
    "Product Weekly": "techcrunch.com",
    "AI Brief": "openai.com",
    "Compute Journal": "www.technologyreview.com",
    "HealthTech Wire": "www.statnews.com",
    "Dev Weekly": "stackoverflow.blog",
    "Venture Grid": "techcrunch.com",
    "Tech Today": "www.cnet.com",
    "Platform Report": "thenewstack.io",
    "Security Ledger": "krebsonsecurity.com",
    "Codebase Review": "github.blog",
    "Hardware Weekly": "www.theverge.com",
    "Market Brief": "www.bloomberg.com",
    "Retail Wire": "www.retaildive.com",
    "Workplace Journal": "www.wsj.com",
    "Startup Ledger": "techcrunch.com",
    "Finance Radar": "www.ft.com",
    "Sports Central": "www.espn.com",
    "Matchday Live": "www.skysports.com",
    "Performance Weekly": "theathletic.com",
    "Training Ground": "www.goal.com",
    "Locker Room News": "www.cbssports.com",
    "Science Desk": "www.sciencedaily.com",
    "Nature Monitor": "www.nature.com",
    "Cosmos Review": "www.space.com",
    "Research Weekly": "phys.org",
    "Field Notes": "www.nationalgeographic.com",
    "Health Journal": "www.healthline.com",
    "Wellness Wire": "www.medicalnewstoday.com",
    "Care Report": "www.who.int",
    "CareTech": "www.fiercehealthcare.com",
    "Healthy Cities": "www.cdc.gov",
}

PUBLISHER_HOME_URLS = {
    "NewsPulse Desk": "https://news.google.com/",
    "NEWSR Desk": "https://news.google.com/",
    "Digital Daily": "https://www.theverge.com/",
    "Signal Watch": "https://www.reuters.com/world/",
    "Morning Scope": "https://apnews.com/",
    "Product Weekly": "https://techcrunch.com/",
    "AI Brief": "https://openai.com/news/",
    "Compute Journal": "https://www.technologyreview.com/topic/artificial-intelligence/",
    "HealthTech Wire": "https://www.statnews.com/",
    "Dev Weekly": "https://stackoverflow.blog/",
    "Venture Grid": "https://techcrunch.com/category/startups/",
    "Tech Today": "https://www.cnet.com/tech/",
    "Platform Report": "https://thenewstack.io/",
    "Security Ledger": "https://krebsonsecurity.com/",
    "Codebase Review": "https://github.blog/",
    "Hardware Weekly": "https://www.theverge.com/tech",
    "Market Brief": "https://www.bloomberg.com/markets",
    "Retail Wire": "https://www.retaildive.com/",
    "Workplace Journal": "https://www.wsj.com/",
    "Startup Ledger": "https://techcrunch.com/startups/",
    "Finance Radar": "https://www.ft.com/markets",
    "Sports Central": "https://www.espn.com/",
    "Matchday Live": "https://www.skysports.com/",
    "Performance Weekly": "https://theathletic.com/",
    "Training Ground": "https://www.goal.com/",
    "Locker Room News": "https://www.cbssports.com/",
    "Science Desk": "https://www.sciencedaily.com/",
    "Nature Monitor": "https://www.nature.com/news",
    "Cosmos Review": "https://www.space.com/",
    "Research Weekly": "https://phys.org/",
    "Field Notes": "https://www.nationalgeographic.com/",
    "Health Journal": "https://www.healthline.com/health-news",
    "Wellness Wire": "https://www.medicalnewstoday.com/",
    "Care Report": "https://www.who.int/news-room",
    "CareTech": "https://www.fiercehealthcare.com/",
    "Healthy Cities": "https://www.cdc.gov/",
}

click_history = []
news_cache = {}

DEMO_ARTICLES = {
    "all": [
        {
            "title": "Global Markets, AI, and Climate Stories Dominate the Morning Brief",
            "description": "Editors are watching a mix of policy, science, and technology headlines as the day begins.",
            "url": "https://example.com/demo/all/morning-brief",
            "image": "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "NewsPulse Desk"},
            "publishedAt": "2026-04-06T08:00:00Z",
        },
        {
            "title": "Why Personalized News Feeds Are Becoming the New Homepage",
            "description": "Readers increasingly expect faster summaries, topic filters, and smarter recommendations.",
            "url": "https://example.com/demo/all/personalized-feeds",
            "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Digital Daily"},
            "publishedAt": "2026-04-06T07:30:00Z",
        },
        {
            "title": "Analysts Track Signals Across Business, Health, and Science",
            "description": "Cross-sector coverage is helping publishers connect readers with broader context.",
            "url": "https://example.com/demo/all/analysts-signals",
            "image": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Signal Watch"},
            "publishedAt": "2026-04-06T06:55:00Z",
        },
    ],
    "ai": [
        {
            "title": "AI Assistants Shift from Novelty to Daily Workflow",
            "description": "Teams are using assistant tools to summarize meetings, draft updates, and speed up research.",
            "url": "https://example.com/demo/ai/daily-workflow",
            "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "AI Brief"},
            "publishedAt": "2026-04-06T08:10:00Z",
        },
        {
            "title": "Smaller AI Models Are Winning on Cost and Speed",
            "description": "Optimization work is helping products ship useful machine learning features on leaner budgets.",
            "url": "https://example.com/demo/ai/smaller-models",
            "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Compute Journal"},
            "publishedAt": "2026-04-06T07:40:00Z",
        },
        {
            "title": "AI Startups Focus on Industry-Specific Automation",
            "description": "New products are targeting finance, logistics, and customer support with narrower workflows.",
            "url": "https://example.com/demo/ai/industry-automation",
            "image": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Venture Grid"},
            "publishedAt": "2026-04-06T05:50:00Z",
        },
    ],
    "technology": [
        {
            "title": "Cloud Teams Push for Faster Deployments",
            "description": "Platform engineers are streamlining release pipelines to reduce waiting and manual checks.",
            "url": "https://example.com/demo/technology/cloud-teams",
            "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Platform Report"},
            "publishedAt": "2026-04-06T07:10:00Z",
        },
        {
            "title": "Cybersecurity Leaders Warn About Social Engineering",
            "description": "Security teams are investing more in employee training as targeted scams become more convincing.",
            "url": "https://example.com/demo/technology/social-engineering",
            "image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Security Ledger"},
            "publishedAt": "2026-04-06T06:30:00Z",
        },
        {
            "title": "Hardware Startups Chase Practical AI Devices",
            "description": "New gadgets are aiming for focused everyday tasks instead of general-purpose hype.",
            "url": "https://example.com/demo/technology/ai-devices",
            "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Hardware Weekly"},
            "publishedAt": "2026-04-06T04:55:00Z",
        },
    ],
    "business": [
        {
            "title": "Small Businesses Rework Pricing as Costs Shift",
            "description": "Owners are adjusting bundles and subscriptions to protect margins while keeping customers.",
            "url": "https://example.com/demo/business/pricing-shifts",
            "image": "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Market Brief"},
            "publishedAt": "2026-04-06T08:00:00Z",
        },
        {
            "title": "Remote Work Keeps Reshaping Hiring Strategies",
            "description": "Organizations are broadening talent searches beyond major cities and large offices.",
            "url": "https://example.com/demo/business/remote-hiring",
            "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Workplace Journal"},
            "publishedAt": "2026-04-06T06:50:00Z",
        },
        {
            "title": "Founders Turn to Automation to Simplify Operations",
            "description": "Lean teams are automating support, billing, and reporting to save time.",
            "url": "https://example.com/demo/business/automation",
            "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Startup Ledger"},
            "publishedAt": "2026-04-06T05:40:00Z",
        },
    ],
    "sports": [
        {
            "title": "Championship Race Tightens After Weekend Results",
            "description": "Several contenders remain separated by only a few points as the season reaches a critical stretch.",
            "url": "https://example.com/demo/sports/championship-race",
            "image": "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Sports Central"},
            "publishedAt": "2026-04-06T08:15:00Z",
        },
        {
            "title": "Coaches Focus on Recovery as Fixture List Grows",
            "description": "Teams are rotating lineups and leaning on sports science to manage player workload.",
            "url": "https://example.com/demo/sports/recovery-focus",
            "image": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Performance Weekly"},
            "publishedAt": "2026-04-06T06:20:00Z",
        },
        {
            "title": "Training Innovation Gives Clubs an Edge",
            "description": "Data-driven drills and video analysis are becoming a larger part of weekly routines.",
            "url": "https://example.com/demo/sports/training-innovation",
            "image": "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Training Ground"},
            "publishedAt": "2026-04-06T05:35:00Z",
        },
    ],
    "science": [
        {
            "title": "New Climate Models Improve Regional Forecast Accuracy",
            "description": "Researchers say updated simulations could help cities plan for more extreme weather patterns.",
            "url": "https://example.com/demo/science/climate-models",
            "image": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Science Desk"},
            "publishedAt": "2026-04-06T08:12:00Z",
        },
        {
            "title": "Ocean Research Team Tracks Shifts in Marine Ecosystems",
            "description": "Long-running surveys are revealing how species are responding to changing temperatures.",
            "url": "https://example.com/demo/science/ocean-research",
            "image": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Nature Monitor"},
            "publishedAt": "2026-04-06T07:22:00Z",
        },
        {
            "title": "Astronomy Teams Prepare for Next Generation Telescope Data",
            "description": "Scientists are building better pipelines to process larger and faster streams of observations.",
            "url": "https://example.com/demo/science/telescope-data",
            "image": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Cosmos Review"},
            "publishedAt": "2026-04-06T06:18:00Z",
        },
    ],
    "health": [
        {
            "title": "Clinics Expand Preventive Care Programs for Earlier Support",
            "description": "Health systems are trying to reduce emergency visits by investing in proactive outreach.",
            "url": "https://example.com/demo/health/preventive-care",
            "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Health Journal"},
            "publishedAt": "2026-04-06T08:07:00Z",
        },
        {
            "title": "Wearable Data Plays a Bigger Role in Daily Wellness",
            "description": "Consumers are using health metrics to understand sleep, stress, and activity trends.",
            "url": "https://example.com/demo/health/wearable-data",
            "image": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Wellness Wire"},
            "publishedAt": "2026-04-06T07:14:00Z",
        },
        {
            "title": "Public Health Teams Focus on Clearer Communication",
            "description": "Officials are experimenting with simpler messaging to improve trust and participation.",
            "url": "https://example.com/demo/health/public-health-comms",
            "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Care Report"},
            "publishedAt": "2026-04-06T06:04:00Z",
        },
    ],
}


def get_token_from_request():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None


def get_optional_user_email():
    token = get_token_from_request()
    return verify_token(token) if token else None


def resolve_article_url(article):
    raw_url = (article.get("url") or "").strip()

    if raw_url and "example.com" not in raw_url:
        return raw_url

    title = article.get("title") or "latest news"
    source_value = article.get("source") or {}
    source_name = source_value.get("name") if isinstance(source_value, dict) else str(source_value)

    direct_source_url = PUBLISHER_HOME_URLS.get(source_name)
    if direct_source_url:
        return direct_source_url

    source_domain = PUBLISHER_SEARCH_DOMAINS.get(source_name, "news.google.com")
    query = quote_plus(f'site:{source_domain} "{title}"')
    return f"https://www.google.com/search?q={query}"


def is_demo_article(article):
    return "example.com" in (article.get("url") or "")


def normalize_article(article, index, page, category=""):
    source_value = article.get("source") or {}
    source_name = source_value.get("name") if isinstance(source_value, dict) else str(source_value)
    raw_published = article.get("publishedAt") or article.get("published_at") or ""
    published_at = parse_published_date(raw_published)
    url = resolve_article_url(article)
    stable_id = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16] if url else f"article-{page}-{index}"

    return {
        "id": stable_id,
        "title": article.get("title") or "Untitled article",
        "description": article.get("description") or "No description was provided for this article.",
        "url": url,
        "isFallback": is_demo_article(article),
        "image": article.get("image") or "",
        "source": source_name or "Unknown source",
        "author": article.get("author") or "",
        "content": article.get("content") or article.get("description") or "",
        "category": article.get("category") or category or "",
        "tags": article.get("tags") or [],
        "published_at": published_at,
        "story_id": article.get("story_id") or "",
        "covered_by": article.get("covered_by") or [source_name or "Unknown source"],
        "publishedAt": published_at,
    }


def parse_published_date(value):
    if not value:
        return ""
    try:
        if isinstance(value, datetime):
            return value.isoformat()
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.isoformat()
    except (TypeError, ValueError):
        try:
            return parsedate_to_datetime(str(value)).isoformat()
        except (TypeError, ValueError, IndexError):
            return ""


def provider_request(method, url, **kwargs):
    last_error = None
    for attempt in range(2):
        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException as error:
            last_error = error
            if attempt == 0:
                time.sleep(0.15)
    raise last_error


def clean_html_text(value):
    text = re.sub(r"<[^>]+>", " ", value or "")
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def extract_image_from_html(value):
    if not value:
        return ""

    image_match = re.search(r'<img[^>]+src="([^"]+)"', value, flags=re.IGNORECASE)
    if image_match:
        return unescape(image_match.group(1)).strip()

    image_match = re.search(r"<img[^>]+src='([^']+)'", value, flags=re.IGNORECASE)
    if image_match:
        return unescape(image_match.group(1)).strip()

    return ""


def simplify_article(article):
    return {
        "id": article.get("id"),
        "title": article.get("title") or "Untitled article",
        "description": article.get("description") or "No description was provided for this article.",
        "url": article.get("url") or "#",
        "image": article.get("image") or "",
        "source": article.get("source") or "Unknown source",
        "author": article.get("author") or "",
        "content": article.get("content") or article.get("description") or "",
        "category": article.get("category") or article.get("topic") or "",
        "tags": article.get("tags") or [],
        "published_at": parse_published_date(article.get("publishedAt") or article.get("published_at")),
        "story_id": article.get("story_id") or "",
        "covered_by": article.get("covered_by") or [article.get("source") or "Unknown source"],
        "publishedAt": article.get("publishedAt") or "2026-04-06T00:00:00Z",
    }


def get_demo_articles(topic, page):
    base_articles = DEMO_ARTICLES.get(topic) or DEMO_ARTICLES["all"]
    expanded_articles = []

    for page_index in range(1, 13):
        for article in base_articles:
            article_copy = dict(article)
            article_copy["title"] = f'{article["title"]} #{page_index}'
            article_copy["url"] = f'{article["url"]}?page={page_index}'
            expanded_articles.append(article_copy)

    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    page_articles = expanded_articles[start:end]
    return [normalize_article(article, index, page) for index, article in enumerate(page_articles)]


def fetch_from_newsdata(topic, page, sort_by):
    if NEWSDATA_API_KEY == "YOUR_NEWSDATA_API_KEY":
        return []

    query = TOPIC_QUERY_MAP[topic]
    page_token = None

    for current_page in range(1, page + 1):
        params = {
            "apikey": NEWSDATA_API_KEY,
            "q": query,
            "language": "en",
            "size": PAGE_SIZE,
        }

        if sort_by == "relevance":
            params["sort"] = "relevancy"

        if page_token:
            params["page"] = page_token

        response = provider_request("GET", NEWSDATA_URL, params=params, timeout=10)
        data = response.json()
        results = data.get("results", [])

        if current_page == page:
            return [
                {
                    "title": article.get("title") or "Untitled article",
                    "description": article.get("description") or "No description was provided for this article.",
                    "url": article.get("link") or "#",
                    "image": article.get("image_url") or "",
                    "source": article.get("source_id") or "NewsData.io",
                    "publishedAt": article.get("pubDate") or "2026-04-06T00:00:00Z",
                }
                for article in results
            ]

        page_token = data.get("nextPage")
        if not page_token:
            return []

    return []


def fetch_from_currents(topic, page):
    if CURRENTS_API_KEY == "YOUR_CURRENTS_API_KEY":
        return []

    params = {
        "keywords": TOPIC_QUERY_MAP[topic],
        "language": "en",
        "page_number": page,
        "page_size": PAGE_SIZE,
        "apiKey": CURRENTS_API_KEY,
    }

    response = provider_request("GET", CURRENTS_SEARCH_URL, params=params, timeout=10)
    data = response.json()

    return [
        {
            "title": article.get("title") or "Untitled article",
            "description": article.get("description") or "No description was provided for this article.",
            "url": article.get("url") or "#",
            "image": article.get("image") or "",
            "source": article.get("author") or "Currents",
            "publishedAt": article.get("published") or "2026-04-06T00:00:00Z",
        }
        for article in data.get("news", [])
    ]


def fetch_from_google_rss(topic):
    queries = TOPIC_RSS_QUERIES.get(topic) or [TOPIC_QUERY_MAP[topic]]
    articles = []

    for query in queries:
        params = {
            "q": query,
            "hl": "en-US",
            "gl": "US",
            "ceid": "US:en",
        }

        response = provider_request("GET", GOOGLE_RSS_URL, params=params, timeout=10)

        root = ElementTree.fromstring(response.content)
        items = root.findall("./channel/item")

        for item in items[:RSS_ITEMS_PER_QUERY]:
            raw_title = item.findtext("title") or "Untitled article"
            source_name = "Google News RSS"
            article_title = raw_title

            if " - " in raw_title:
                article_title, source_name = raw_title.rsplit(" - ", 1)

            raw_description = item.findtext("description") or ""
            description = clean_html_text(raw_description)
            image_url = extract_image_from_html(raw_description)
            published_at = item.findtext("pubDate") or ""

            if published_at:
                try:
                    published_at = parsedate_to_datetime(published_at).isoformat()
                except (TypeError, ValueError):
                    published_at = "2026-04-06T00:00:00Z"
            else:
                published_at = "2026-04-06T00:00:00Z"

            articles.append(
                {
                    "title": article_title or "Untitled article",
                    "description": description or "No description was provided for this article.",
                    "url": item.findtext("link") or "#",
                    "image": image_url,
                    "source": source_name or "Google News RSS",
                    "publishedAt": published_at,
                }
            )

    return articles


def dedupe_articles(articles):
    deduped = []
    seen_urls = set()
    seen_titles = set()

    for article in articles:
        url = (article.get("url") or "").strip()
        title = (article.get("title") or "").strip().lower()

        if url and url in seen_urls:
            continue
        if title and title in seen_titles:
            continue

        if url:
            seen_urls.add(url)
        if title:
            seen_titles.add(title)

        deduped.append(article)

    return deduped


def sort_articles(articles, sort_by):
    if sort_by == "relevance":
        return articles

    def published_key(article):
        published_at = article.get("publishedAt") or ""

        try:
            return datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        except (TypeError, ValueError):
            try:
                return parsedate_to_datetime(published_at)
            except (TypeError, ValueError):
                return None

    def published_timestamp(article):
        published_value = published_key(article)
        return published_value.timestamp() if published_value else 0

    return sorted(articles, key=published_timestamp, reverse=True)


def fetch_articles_with_fallback(topic, page, sort_by):
    cache_key = (topic, page, sort_by)
    cached = news_cache.get(cache_key)
    if cached and (datetime.now().timestamp() - cached["timestamp"]) < NEWS_CACHE_SECONDS:
        return cached["articles"]
    provider_results = []
    providers = [
        lambda: fetch_from_newsdata(topic, page, sort_by),
        lambda: fetch_from_currents(topic, page),
        lambda: fetch_from_google_rss(topic),
    ]

    for provider in providers:
        try:
            provider_results.extend(provider())
        except (requests.RequestException, ValueError, ElementTree.ParseError):
            continue

    combined = group_stories(
        dedupe_articles(provider_results),
        threshold=STORY_SIMILARITY_THRESHOLD,
        title_threshold=STORY_TITLE_THRESHOLD,
    )
    combined = sort_articles(combined, sort_by)

    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    paged_articles = combined[start:end]

    if paged_articles:
        news_cache[cache_key] = {"timestamp": datetime.now().timestamp(), "articles": paged_articles}
        return paged_articles

    fallback = group_stories(
        get_demo_articles(topic, page),
        threshold=STORY_SIMILARITY_THRESHOLD,
        title_threshold=STORY_TITLE_THRESHOLD,
    )
    news_cache[cache_key] = {"timestamp": datetime.now().timestamp(), "articles": fallback}
    return fallback


def summarize_text_content(text):
    cleaned_text = (text or "").strip()
    return {
        "page_count": 0,
        "word_count": len(cleaned_text.split()) if cleaned_text else 0,
        "headlines": extract_headlines_from_text(cleaned_text),
        "summary": generate_summary_from_text(cleaned_text),
        "topics": detect_topics_from_text(cleaned_text),
    }


@app.route("/auth/register", methods=["POST"])
def auth_register():
    payload, status = register_user(request.get_json(silent=True) or {}, mail)
    return jsonify(payload), status


@app.route("/auth/login", methods=["POST"])
def auth_login():
    payload, status = login_user(request.get_json(silent=True) or {})
    return jsonify(payload), status


@app.route("/auth/google", methods=["POST"])
def auth_google():
    payload, status = login_with_google(request.get_json(silent=True) or {})
    return jsonify(payload), status


@app.route("/auth/logout", methods=["POST"])
def auth_logout():
    payload, status = logout_user(get_token_from_request())
    return jsonify(payload), status


@app.route("/auth/forgot-password", methods=["POST"])
def auth_forgot_password():
    payload, status = forgot_password(request.get_json(silent=True) or {}, mail)
    return jsonify(payload), status


@app.route("/auth/reset-password", methods=["POST"])
def auth_reset_password():
    payload, status = reset_password(request.get_json(silent=True) or {})
    return jsonify(payload), status


@app.route("/auth/me", methods=["GET"])
def auth_me():
    payload, status = get_current_user(get_token_from_request())
    return jsonify(payload), status


@app.route("/auth/preferences", methods=["PUT"])
@require_auth
def auth_preferences():
    payload, status = update_preferences(get_token_from_request(), request.get_json(silent=True) or {})
    return jsonify(payload), status


@app.route("/news", methods=["GET"])
def get_news():
    topic = (request.args.get("topic") or "ai").lower()
    try:
        page = max(int(request.args.get("page", 1)), 1)
    except (TypeError, ValueError):
        return jsonify({"error": "Page must be a positive integer."}), 400
    sort_by = (request.args.get("sortBy") or "latest").lower()

    if topic not in TOPIC_QUERY_MAP:
        return jsonify({"error": "Invalid topic supplied."}), 400

    if sort_by not in {"latest", "relevance"}:
        sort_by = "latest"

    articles = fetch_articles_with_fallback(topic, page, sort_by)
    normalized_articles = [normalize_article(article, index, page, topic) for index, article in enumerate(articles)]
    for article in normalized_articles:
        storage.save_article(article)
    return jsonify(normalized_articles)


@app.route("/recommend", methods=["POST"])
def recommend_articles():
    payload = request.get_json(silent=True) or {}
    clicked = payload.get("clicked") or {}
    articles = payload.get("articles") or []
    history = payload.get("history") or []

    if not clicked or not isinstance(articles, list) or not isinstance(history, list):
        return jsonify({"error": "Invalid request body."}), 400

    user_id = get_optional_user_email()
    recommendations = recommendation_service.recommend(clicked, articles, history, user_id)
    storage.save_recommendations(user_id, recommendations)
    return jsonify(recommendations)


@app.route("/track_click", methods=["POST"])
def track_click():
    payload = request.get_json(silent=True) or {}
    article = payload.get("article") or {}
    topic = (payload.get("topic") or "").lower()

    if not article or topic not in TOPIC_QUERY_MAP:
        return jsonify({"error": "Invalid tracking payload."}), 400

    stored_article = simplify_article(article)
    stored_article["topic"] = topic
    user_id = get_optional_user_email()
    action = (payload.get("action") or "click").lower()
    interaction = {
        "user_id": user_id or "anonymous",
        "article_id": stored_article.get("id") or stored_article.get("url"),
        "url": stored_article.get("url"),
        "topic": topic,
        "category": stored_article.get("category") or topic,
        "story_id": stored_article.get("story_id") or stored_article.get("url"),
        "title": stored_article.get("title"),
        "source": stored_article.get("source"),
        "action": action,
        "duration_seconds": max(0, int(payload.get("duration_seconds") or 0)),
        "timestamp": datetime.now().isoformat(),
    }
    storage.save_interaction(interaction)
    storage.save_article(stored_article)
    if user_id:
        click_history.append(stored_article)
    else:
        click_history.append({**stored_article, "interaction": interaction})

    if len(click_history) > 10:
        del click_history[0 : len(click_history) - 10]

    recent_titles = [item.get("title") or "Untitled article" for item in click_history[-5:]]
    return jsonify({"history": recent_titles})


@app.route("/track_interaction", methods=["POST"])
def track_interaction():
    payload = request.get_json(silent=True) or {}
    action = (payload.get("action") or "").lower()
    topic = (payload.get("topic") or "").lower()
    allowed_actions = {"search", "category_view", "skip"}
    if action not in allowed_actions or topic not in TOPIC_QUERY_MAP:
        return jsonify({"error": "Invalid interaction payload."}), 400
    storage.save_interaction({
        "user_id": get_optional_user_email() or "anonymous",
        "action": action,
        "topic": topic,
        "query": (payload.get("query") or "").strip()[:120],
        "timestamp": datetime.now().isoformat(),
    })
    return jsonify({"tracked": True}), 201


@app.route("/track_reading", methods=["POST"])
def track_reading():
    payload = request.get_json(silent=True) or {}
    article = payload.get("article") or {}
    topic = (payload.get("topic") or "").lower()
    duration_seconds = payload.get("duration_seconds")
    try:
        duration_seconds = max(0, min(int(duration_seconds), 24 * 60 * 60))
    except (TypeError, ValueError):
        return jsonify({"error": "duration_seconds must be a non-negative integer."}), 400
    if not article.get("url") or topic not in TOPIC_QUERY_MAP:
        return jsonify({"error": "A valid article and topic are required."}), 400
    stored_article = simplify_article(article)
    storage.save_interaction({
        "user_id": get_optional_user_email() or "anonymous",
        "article_id": stored_article.get("id") or stored_article.get("url"),
        "url": stored_article.get("url"),
        "title": stored_article.get("title"),
        "topic": topic,
        "category": stored_article.get("category") or topic,
        "story_id": stored_article.get("story_id") or stored_article.get("url"),
        "action": "reading_complete",
        "duration_seconds": duration_seconds,
        "timestamp": datetime.now().isoformat(),
    })
    return jsonify({"tracked": True, "duration_seconds": duration_seconds}), 201


@app.route("/click_history", methods=["GET"])
@require_auth
def get_click_history():
    return jsonify(storage.get_reading_history(g.current_user_email, 10))


@app.route("/bookmarks", methods=["GET"])
@require_auth
def get_bookmarks():
    return jsonify(storage.get_bookmarks(g.current_user_email))


@app.route("/reading-history", methods=["GET"])
@require_auth
def get_reading_history():
    return jsonify(storage.get_reading_history(g.current_user_email))


@app.route("/trending", methods=["GET"])
def get_trending():
    return jsonify(get_trending_stories())


@app.route("/analytics", methods=["GET"])
@require_auth
def get_analytics():
    return jsonify(analytics_for_user(g.current_user_email))


@app.route("/briefing", methods=["GET"])
@require_auth
def get_daily_briefing():
    user_id = g.current_user_email
    profile = build_interest_profile(user_id)
    articles = storage.list_articles(100)
    trending = {item.get("story_id"): item for item in get_trending_stories(100)}
    max_trend = max((item.get("score", 0) for item in trending.values()), default=1)

    def briefing_score(article):
        topic = (article.get("category") or article.get("topic") or "").lower()
        trend = trending.get(article.get("story_id"), {})
        trend_score = trend.get("score", 0) / max_trend
        recency = recommendation_service._recency_score(article.get("publishedAt") or article.get("published_at"))
        interest = profile.get(topic, 0)
        return (interest * 0.5) + (trend_score * 0.25) + (recency * 0.25)

    ranked = sorted(articles, key=briefing_score, reverse=True)
    selected = []
    seen_stories = set()
    seen_sources = set()
    for article in ranked:
        story_key = article.get("story_id") or (article.get("title") or "").lower()[:60]
        if story_key in seen_stories:
            continue
        source = article.get("source") or "Unknown source"
        if source in seen_sources and len(selected) < 3:
            continue
        seen_stories.add(story_key)
        seen_sources.add(source)
        enriched = dict(article)
        enriched["briefing_score"] = round(briefing_score(article), 3)
        enriched["briefing_reason"] = "Matched to your interests and recent reading."
        if article.get("story_id") in trending:
            enriched["briefing_reason"] = "Relevant to your interests and active in recent coverage."
        selected.append(enriched)
        if len(selected) == 5:
            break
    word_count = sum(len((article.get("content") or article.get("description") or "").split()) for article in selected)
    estimated_minutes = max(1, round(word_count / 220)) if selected else 0
    return jsonify({"articles": selected, "estimated_reading_minutes": estimated_minutes, "personalized": True})


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "storage": storage.mode})


@app.route("/summarize", methods=["POST"])
def summarize_content():
    uploaded_file = request.files.get("file")
    raw_text = (request.form.get("text") or "").strip()

    if uploaded_file and uploaded_file.filename:
        file_bytes = uploaded_file.read(MAX_PDF_BYTES + 1)
        if not uploaded_file.filename.lower().endswith(".pdf") or not file_bytes.startswith(b"%PDF"):
            return jsonify({"error": "Only PDF uploads are supported for files."}), 400
        if len(file_bytes) > MAX_PDF_BYTES:
            return jsonify({"error": "PDF exceeds the maximum allowed size."}), 413
        extraction_result = extract_text_from_pdf(file_bytes)

        if extraction_result.get("error"):
            return jsonify({"error": extraction_result["error"]}), 400

        extracted_text = extraction_result.get("text", "")
        if not extracted_text.strip():
            return jsonify({"error": "No readable text was found in this PDF."}), 400

        summary_result = summarize_text_content(extracted_text)
        summary_result["page_count"] = extraction_result.get("page_count", 0)
        return jsonify(summary_result)

    if raw_text:
        return jsonify(summarize_text_content(raw_text))

    return jsonify({"error": "Upload a PDF or paste text to summarize."}), 400


@app.route("/article-tools", methods=["POST"])
def article_tools():
    payload = request.get_json(silent=True) or {}
    article = payload.get("article") or {}
    if not article.get("title") and not article.get("description"):
        return jsonify({"error": "An article title or description is required."}), 400
    return jsonify(generate_article_tools(
        article.get("title", ""),
        article.get("description", ""),
        article.get("content", ""),
    ))


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)
