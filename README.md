# NewsPulse Intelligence

NewsPulse is a personalized news intelligence platform built around a React feed and a Flask service. It aggregates multi-source news, keeps demo content available when providers are unavailable, groups likely duplicate coverage into stories, learns from reading behavior, and produces explainable recommendations.

## Features

- Topic feeds, search, sorting, featured stories, bookmarks, and reading history
- NewsData, Currents, and Google News RSS providers with demo fallback articles
- URL/title deduplication plus lightweight TF-IDF story grouping
- JWT authentication with hashed passwords, expiration, logout revocation, and reset flow
- Reusable JWT middleware protecting preferences, bookmarks, history, analytics, and briefing routes
- MongoDB persistence when `MONGO_URI` is configured, with an in-memory local fallback
- Time-decayed interest profiles from clicks, bookmarks, searches, and reading duration
- Hybrid recommendations combining TF-IDF similarity, interest signals, recency, and consumption avoidance
- Human-readable recommendation explanations
- Daily briefing with estimated reading time
- Analytics for actual stored interactions
- Local text/PDF summarization and topic/headline extraction
- Docker Compose, focused backend tests, and GitHub Actions CI
- Security headers, strict PDF signature/size validation, malformed-request handling, and protected user routes

## Architecture

```text
React/Vite frontend
        |
        | JSON + multipart HTTP
        v
Flask routes -> news providers -> normalization -> dedupe/story grouping -> cache
        |
        +-> storage boundary -> MongoDB or local demo memory
        +-> interest profile -> hybrid recommender
        +-> PDF/text extraction and local summarization
```

The frontend uses `frontend/src/services/api.js` as its HTTP boundary. The backend keeps route handlers thin enough to delegate authentication, storage, profiling, recommendation, and story detection to separate modules.

## Technology Stack

- Frontend: React 18, Vite, JavaScript/JSX, plain CSS
- Backend: Python, Flask, Flask-CORS, Flask-Mail
- Data: MongoDB through PyMongo, with an explicit in-memory demo fallback
- ML/NLP: scikit-learn TF-IDF and cosine similarity
- Documents: PyMuPDF
- Security: Werkzeug password hashing and PyJWT
- Operations: Docker, Docker Compose, GitHub Actions

## News Pipeline

The current providers are:

1. NewsData
2. Currents
3. Google News RSS
4. Built-in demo fallback content

Every provider result is normalized to a common article structure, validated for missing fields, deduplicated, grouped into likely stories, sorted, cached briefly, and returned to the frontend. Story grouping is similarity-based and does not claim that a story is factually true.

Normalized articles include `id`, `title`, `description`, `url`, `image`, `source`, `author`, `content`, `category`, `tags`, `published_at`, `publishedAt`, `story_id`, and `covered_by`. Provider failures are retried once and then fall back to other providers or demo content. Story similarity and title thresholds are configurable through `STORY_SIMILARITY_THRESHOLD` and `STORY_TITLE_THRESHOLD`.

## Recommendation System

The existing TF-IDF plus cosine similarity engine remains the content-similarity foundation. The hybrid service combines configurable weights for:

- time-decayed topic interest
- click and bookmark behavior
- long reading sessions
- recency
- articles already consumed

The defaults are content `0.45`, interest `0.25`, behavior `0.15`, trending `0.10`, and recency `0.05`. Authenticated recommendation requests include the JWT so profile-aware scoring is applied; new users still receive content-based recommendations.

Recommendation responses include `matchScore` and `because_of`. Explanations are derived from the available signals, for example “Because you frequently read ai stories” or “Similar to an article you recently read.”

## Interest Profiling and Analytics

Interactions use configurable weights: bookmark `+5`, long read `+4`, search `+3`, click `+2`, category view `+1`, and skip `-1`. Scores decay over time and are normalized per user. Search, topic views, and viewport-based skips are tracked by the frontend; analytics are calculated from stored interactions rather than fabricated values.

The frontend records the initial click and sends one bounded `reading_complete` event when the user returns from the publisher tab or the page is hidden/unloaded. The request uses `keepalive` for lifecycle delivery. Bookmarks are also recorded as behavior signals.

## API Endpoints

- `GET /health`
- `GET /news?topic=ai&page=1&sortBy=latest`
- `POST /recommend`
- `POST /track_click`
- `POST /track_reading`
- `GET /click_history`
- `GET /trending`
- `GET /bookmarks` (authenticated)
- `GET /reading-history` (authenticated)
- `GET /analytics` (authenticated)
- `GET /briefing` (authenticated)
- `POST /summarize`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/preferences`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Storage Model

MongoDB uses these collections when enabled:

- `users`: identity, password hash, preferences, and timestamps
- `preferences`: user topic/language preferences keyed by user ID
- `interactions`: user/article/action/duration/topic/timestamp signals
- `articles`: normalized articles keyed by URL
- `bookmarks`: authenticated saved articles keyed by user and URL
- `reading_history`: authenticated click/read events
- `story_groups`: grouped coverage, titles, and source lists
- `recommendations`: timestamped recommendation snapshots for authenticated users

Indexes are created for user email, interaction user/time, and article URL. Local development without MongoDB uses the same storage API in memory so demo news still works.

## Environment Variables

Copy `.env.example` to `.env` and set values as needed:

```text
JWT_SECRET=replace-with-a-random-32-byte-secret
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=newspulse
NEWSDATA_API_KEY=...
CURRENTS_API_KEY=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

For Google Sign-In, create a Google OAuth **Web application** client, add `http://localhost:5173` to its Authorized JavaScript origins, then set the client ID in the root `.env` as `GOOGLE_CLIENT_ID` and in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`. The two values must match.

Never commit real keys or passwords. Provider keys may remain placeholder values; Google RSS and demo data continue to work.

## Local Setup

Backend:

```bash
python -m venv .venv
.venv/Scripts/pip install -r backend/requirements.txt
.venv/Scripts/python backend/app.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Docker

Create `.env`, then run:

```bash
docker compose up --build
```

The frontend is exposed on port `5173`, the backend on `5000`, and MongoDB on its internal Compose network.

## Testing and CI

```bash
.venv/Scripts/python -m pytest backend/tests -q
cd frontend && npm run build
```

GitHub Actions runs backend tests and the production frontend build for pushes and pull requests.
It also compiles the backend and builds both backend and frontend Docker images.

The local test suite covers story grouping, normalized fallback news, authentication, protected routes, reading tracking, article tools, malformed pagination, and invalid PDF uploads.

## Limitations

- MongoDB is optional locally; memory fallback data disappears when the server restarts.
- News provider quotas, API availability, and article licensing remain external concerns.
- Story grouping is a practical similarity heuristic and can make mistakes.
- Summarization is local extractive/NLP processing, not a claim of human-level understanding.
- The current frontend opens publisher pages in a new tab, so duration is measured when the user returns to NewsPulse.
- Docker image builds require a running Docker daemon; Compose configuration is validated locally, but image execution was not available in this environment.

## Future Improvements

- Add a persistent recommendation snapshot collection and scheduled briefing generation.
- Add richer source diversity and story-level trend scoring.
- Add route-level integration tests with a temporary MongoDB instance.
- Add a dedicated article reader view for more precise reading-time events.
