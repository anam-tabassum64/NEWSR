from collections import Counter
from datetime import datetime
from email.utils import parsedate_to_datetime
from html import unescape
import re
from xml.etree import ElementTree

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from pdf_extractor import (
    detect_topics_from_text,
    extract_headlines_from_text,
    extract_text_from_pdf,
    generate_summary_from_text,
)
from recommender import NewsRecommender


app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

NEWSDATA_API_KEY = "YOUR_NEWSDATA_API_KEY"
CURRENTS_API_KEY = "YOUR_CURRENTS_API_KEY"
NEWSDATA_URL = "https://newsdata.io/api/1/latest"
CURRENTS_SEARCH_URL = "https://api.currentsapi.services/v1/search"
GOOGLE_RSS_URL = "https://news.google.com/rss/search"
TOPIC_QUERY_MAP = {
    "all": "latest news",
    "ai": "artificial intelligence",
    "technology": "technology",
    "business": "business",
    "sports": "sports",
    "science": "science",
    "health": "health",
}

recommender = NewsRecommender()
click_history = []

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
        {
            "title": "Five Big Stories Readers Are Following Right Now",
            "description": "From startups to sports, audience attention is moving quickly between major live topics.",
            "url": "https://example.com/demo/all/five-big-stories",
            "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Morning Scope"},
            "publishedAt": "2026-04-06T06:20:00Z",
        },
        {
            "title": "Publishers Experiment with Simpler Reading Experiences",
            "description": "Minimal card layouts and faster pages continue to improve session times on mobile.",
            "url": "https://example.com/demo/all/publisher-experiments",
            "image": "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Product Weekly"},
            "publishedAt": "2026-04-06T05:30:00Z",
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
            "title": "Hospitals Explore AI Alerts for Early Intervention",
            "description": "Pilot programs are testing whether predictive systems can flag patient risk sooner.",
            "url": "https://example.com/demo/ai/hospital-alerts",
            "image": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "HealthTech Wire"},
            "publishedAt": "2026-04-06T07:05:00Z",
        },
        {
            "title": "Developers Depend More on AI Coding Tools Across the Stack",
            "description": "Engineering teams say autocomplete, refactoring help, and documentation support reduce repetition.",
            "url": "https://example.com/demo/ai/coding-tools",
            "image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Dev Weekly"},
            "publishedAt": "2026-04-06T06:15:00Z",
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
            "title": "Consumer Devices Highlight Battery and Camera Gains",
            "description": "Manufacturers are focusing on practical improvements that matter more than headline specs.",
            "url": "https://example.com/demo/technology/device-gains",
            "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Tech Today"},
            "publishedAt": "2026-04-06T08:05:00Z",
        },
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
            "title": "Open Source Tools Continue to Shape Modern Development",
            "description": "Teams combine internal platforms with community projects to ship features more efficiently.",
            "url": "https://example.com/demo/technology/open-source",
            "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Codebase Review"},
            "publishedAt": "2026-04-06T05:45:00Z",
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
            "title": "Retail Brands Expand Loyalty Programs for Repeat Sales",
            "description": "Companies are investing in rewards, memberships, and personalization to hold attention.",
            "url": "https://example.com/demo/business/loyalty-programs",
            "image": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Retail Wire"},
            "publishedAt": "2026-04-06T07:25:00Z",
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
        {
            "title": "Investors Watch Consumer Spending for Recovery Signals",
            "description": "Analysts are focusing on demand patterns across retail, travel, and digital services.",
            "url": "https://example.com/demo/business/recovery-signals",
            "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Finance Radar"},
            "publishedAt": "2026-04-06T04:50:00Z",
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
            "title": "Young Star Delivers Breakout Performance at Home",
            "description": "Fans celebrated a standout display that could mark a major step forward this season.",
            "url": "https://example.com/demo/sports/breakout-performance",
            "image": "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Matchday Live"},
            "publishedAt": "2026-04-06T07:05:00Z",
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
        {
            "title": "Veteran Leadership Helps Squad Through Tight Schedule",
            "description": "Experienced players are setting the tone as teams navigate intense competition.",
            "url": "https://example.com/demo/sports/veteran-leadership",
            "image": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Locker Room News"},
            "publishedAt": "2026-04-06T04:40:00Z",
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
        {
            "title": "Lab Automation Helps Researchers Run More Experiments",
            "description": "Teams are adopting software and robotics to reduce manual bottlenecks in testing cycles.",
            "url": "https://example.com/demo/science/lab-automation",
            "image": "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Research Weekly"},
            "publishedAt": "2026-04-06T05:24:00Z",
        },
        {
            "title": "Biologists Share New Findings on Urban Wildlife Adaptation",
            "description": "Studies suggest some species are changing behavior faster than expected in dense cities.",
            "url": "https://example.com/demo/science/urban-wildlife",
            "image": "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Field Notes"},
            "publishedAt": "2026-04-06T04:42:00Z",
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
        {
            "title": "Digital Health Platforms Add Better Patient Follow-Up",
            "description": "Providers want smoother post-visit experiences with reminders and simple check-ins.",
            "url": "https://example.com/demo/health/follow-up",
            "image": "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "CareTech"},
            "publishedAt": "2026-04-06T05:08:00Z",
        },
        {
            "title": "Nutrition Programs Explore New Community Partnerships",
            "description": "Local health groups are connecting schools, clinics, and nonprofits to widen support.",
            "url": "https://example.com/demo/health/community-partnerships",
            "image": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
            "source": {"name": "Healthy Cities"},
            "publishedAt": "2026-04-06T04:36:00Z",
        },
    ],
}
PAGE_SIZE = 12


def normalize_article(article, index, page):
    source_value = article.get("source") or {}

    if isinstance(source_value, dict):
        source_name = source_value.get("name") or "Unknown source"
    else:
        source_name = str(source_value) or "Unknown source"

    return {
        "id": ((page - 1) * PAGE_SIZE) + index + 1,
        "title": article.get("title") or "Untitled article",
        "description": article.get("description")
        or "No description was provided for this article.",
        "url": article.get("url") or "#",
        "image": article.get("image") or "",
        "source": source_name,
        "publishedAt": article.get("publishedAt") or "2026-04-06T00:00:00Z",
    }


def clean_html_text(value):
    text = re.sub(r"<[^>]+>", " ", value or "")
    text = unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def simplify_article(article):
    return {
        "id": article.get("id"),
        "title": article.get("title") or "Untitled article",
        "description": article.get("description")
        or "No description was provided for this article.",
        "url": article.get("url") or "#",
        "image": article.get("image") or "",
        "source": article.get("source") or "Unknown source",
        "publishedAt": article.get("publishedAt") or "2026-04-06T00:00:00Z",
    }


def get_demo_articles(topic, page):
    base_articles = DEMO_ARTICLES.get(topic) or DEMO_ARTICLES["all"]
    expanded_articles = []

    # Create enough demo entries to simulate paginated "load more" behavior
    # when a real GNews API key is not configured.
    for page_index in range(1, 5):
      for article in base_articles:
        article_copy = dict(article)
        article_copy["title"] = f'{article["title"]} #{page_index}'
        article_copy["url"] = f'{article["url"]}?page={page_index}'
        expanded_articles.append(article_copy)

    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    page_articles = expanded_articles[start:end]

    normalized = [
        normalize_article(article, index, page) for index, article in enumerate(page_articles)
    ]
    return normalized


def fetch_from_newsdata(topic, page, sort_by):
    if NEWSDATA_API_KEY == "YOUR_NEWSDATA_API_KEY":
        return []

    query = TOPIC_QUERY_MAP[topic]
    page_token = None

    # NewsData.io pagination uses a response token called nextPage instead of
    # a simple page number, so we walk forward until we reach the requested page.
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

        response = requests.get(NEWSDATA_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])

        if current_page == page:
            return [
                {
                    "title": article.get("title") or "Untitled article",
                    "description": article.get("description")
                    or "No description was provided for this article.",
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

    response = requests.get(CURRENTS_SEARCH_URL, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    return [
        {
            "title": article.get("title") or "Untitled article",
            "description": article.get("description")
            or "No description was provided for this article.",
            "url": article.get("url") or "#",
            "image": article.get("image") or "",
            "source": article.get("author") or "Currents",
            "publishedAt": article.get("published") or "2026-04-06T00:00:00Z",
        }
        for article in data.get("news", [])
    ]


def fetch_from_google_rss(topic):
    params = {
        "q": TOPIC_QUERY_MAP[topic],
        "hl": "en-US",
        "gl": "US",
        "ceid": "US:en",
    }

    response = requests.get(GOOGLE_RSS_URL, params=params, timeout=10)
    response.raise_for_status()

    root = ElementTree.fromstring(response.content)
    items = root.findall("./channel/item")
    articles = []

    for item in items[: PAGE_SIZE * 2]:
        raw_title = item.findtext("title") or "Untitled article"
        source_name = "Google News RSS"
        article_title = raw_title

        if " - " in raw_title:
            article_title, source_name = raw_title.rsplit(" - ", 1)

        description = clean_html_text(item.findtext("description") or "")
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
                "image": "",
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

    sorted_articles = sorted(
        articles,
        key=published_timestamp,
        reverse=True,
    )
    return sorted_articles


def fetch_articles_with_fallback(topic, page, sort_by):
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

    combined = dedupe_articles(provider_results)
    combined = sort_articles(combined, sort_by)

    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    paged_articles = combined[start:end]

    if paged_articles:
        return paged_articles

    return get_demo_articles(topic, page)


def summarize_text_content(text):
    cleaned_text = (text or "").strip()
    headlines = extract_headlines_from_text(cleaned_text)
    summary = generate_summary_from_text(cleaned_text)
    topics = detect_topics_from_text(cleaned_text)

    return {
        "page_count": 0,
        "word_count": len(cleaned_text.split()) if cleaned_text else 0,
        "headlines": headlines,
        "summary": summary,
        "topics": topics,
    }


@app.route("/news", methods=["GET"])
def get_news():
    topic = (request.args.get("topic") or "ai").lower()
    page = max(int(request.args.get("page", 1)), 1)
    sort_by = (request.args.get("sortBy") or "latest").lower()

    if topic not in TOPIC_QUERY_MAP:
        return jsonify({"error": "Invalid topic supplied."}), 400

    if sort_by not in {"latest", "relevance"}:
        sort_by = "latest"

    articles = fetch_articles_with_fallback(topic, page, sort_by)
    normalized_articles = [
        normalize_article(article, index, page) for index, article in enumerate(articles)
    ]
    return jsonify(normalized_articles)


@app.route("/recommend", methods=["POST"])
def recommend_articles():
    payload = request.get_json(silent=True) or {}
    clicked = payload.get("clicked") or {}
    articles = payload.get("articles") or []
    history = payload.get("history") or []

    if not clicked or not isinstance(articles, list) or not isinstance(history, list):
        return jsonify({"error": "Invalid request body."}), 400

    return jsonify(recommender.recommend(clicked, articles, history))


@app.route("/track_click", methods=["POST"])
def track_click():
    payload = request.get_json(silent=True) or {}
    article = payload.get("article") or {}
    topic = (payload.get("topic") or "").lower()

    if not article or topic not in TOPIC_QUERY_MAP:
        return jsonify({"error": "Invalid tracking payload."}), 400

    stored_article = simplify_article(article)
    stored_article["topic"] = topic
    click_history.append(stored_article)

    if len(click_history) > 10:
        del click_history[0 : len(click_history) - 10]

    recent_titles = [item.get("title") or "Untitled article" for item in click_history[-5:]]
    return jsonify({"history": recent_titles})


@app.route("/click_history", methods=["GET"])
def get_click_history():
    return jsonify(click_history[-10:])


@app.route("/trending", methods=["GET"])
def get_trending():
    counts = Counter(item["topic"] for item in click_history)
    trending = [{"topic": topic, "count": count} for topic, count in counts.most_common()]
    return jsonify(trending)


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})


@app.route("/summarize", methods=["POST"])
def summarize_content():
    uploaded_file = request.files.get("file")
    raw_text = (request.form.get("text") or "").strip()

    if uploaded_file and uploaded_file.filename:
        if not uploaded_file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF uploads are supported for files."}), 400

        file_bytes = uploaded_file.read()
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


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False)
