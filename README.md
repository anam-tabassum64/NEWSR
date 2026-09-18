# 📰 NewsPulse – Personalized News Intelligence

[![React.js](https://img.shields.io/badge/React.js-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PyMongo](https://img.shields.io/badge/PyMongo-Driver-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://pymongo.readthedocs.io/)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

> 📰 Personalized news. Smarter discovery. One unified platform.

---

## 📌 Overview

NewsPulse is a full-stack personalized news intelligence platform that brings articles from multiple sources into one unified experience. It combines a React frontend, Flask backend, MongoDB data layer, and recommendation engine to help users discover relevant content faster and build a more personalized reading habit.

The platform aggregates content from NewsData, Currents, and Google News RSS, normalizes it into a common article model, identifies related coverage, tracks user behavior, and recommends stories based on interest profiles and reading activity.

### Highlights

- 📰 Multi-source news aggregation
- 🤖 Personalized recommendations
- 🔐 JWT authentication
- 🔖 Bookmarking and saved articles
- 📖 Reading history tracking
- ⚙️ User preferences and analytics
- 📝 Summaries for text and PDF content
- 📅 Daily briefing generation
- 🔄 Fallback demo content when providers fail
- 🐳 Dockerized deployment
- ⚙️ CI/CD with GitHub Actions

---

# ✨ Features

| 🚀 Feature | 🔹 Description |
|---|---|
| 📰 **Multi-source news** | Aggregates articles from multiple providers and RSS sources |
| 🤖 **Personalized recommendations** | Uses TF-IDF similarity, interests, behavior, recency, and trending signals |
| 🔐 **JWT authentication** | Secures user-specific routes and session flows |
| 🔖 **Bookmarks** | Allows users to save articles for later reading |
| 📖 **Reading history** | Tracks clicks, reads, and engagement behavior |
| ⚙️ **User preferences** | Captures topic and language interests for personalization |
| 📊 **Analytics** | Measures user interaction, behavior, and engagement |
| 📝 **News summarization** | Produces concise summaries from supported content |
| 📅 **Daily briefings** | Combines relevant stories into a personalized reporting view |
| 📄 **PDF/text summarization** | Supports extraction and summarization for uploaded documents |
| 🔄 **Fallback handling** | Keeps the app functional with demo content during provider outages |
| 🐳 **Docker support** | Easy setup and isolated deployment with Docker Compose |
| ⚙️ **GitHub Actions** | Automated validation for tests and build workflows |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │       NEWS SOURCES       │
                         │                          │
                         │ NewsData + Currents +    │
                         │    Google News RSS       │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │      FLASK BACKEND       │
                         │                          │
                         │ REST APIs                │
                         │ Authentication           │
                         │ Story grouping           │
                         │ Content normalization    │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
     ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
     │   MongoDB       │    │ Recommendation  │    │ Summarization   │
     │   Database      │    │     Engine      │    │     Engine      │
     └─────────────────┘    └─────────────────┘    └─────────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │      REACT FRONTEND      │
                         │                          │
                         │ Search • Feed • Articles │
                         │ Bookmarks • Analytics    │
                         │ Preferences • Profile   │
                         └──────────────────────────┘
```

---

# 🧩 Project Modules

## 🎨 1. Frontend Module

The frontend is built with React and Vite and provides the user-facing experience for discovery, personalization, and account management.

### Responsibilities

- 📰 Display personalized news feeds
- 🔍 Search and topic browsing
- 📑 View article details and recommendations
- 🔖 Manage bookmarks and saved stories
- 📖 View reading history
- ⚙️ Update user preferences
- 📊 Access analytics dashboards
- 📝 Open summaries and briefing views
- 🔐 Handle authentication state
- 🔄 Communicate with backend APIs

---

## ⚙️ 2. Backend Module

The backend is built with Python and Flask and acts as the central application layer for the platform.

### Responsibilities

- 🔐 Authentication and session handling
- 👤 User registration and account management
- 📰 News retrieval and normalization
- 🔌 External provider integration
- 📡 RSS feed processing
- 🔖 Bookmark management
- 📖 Reading history tracking
- ⚙️ User preference logic
- 🤖 Recommendation scoring
- 📝 Summarization and briefing generation
- 📊 Analytics and interaction processing

---

## 🗄️ 3. Database Module

NewsPulse uses MongoDB with PyMongo, with an in-memory fallback for local development when MongoDB is not configured.

### Collections

- `users`
- `preferences`
- `interactions`
- `articles`
- `bookmarks`
- `reading_history`
- `story_groups`
- `recommendations`

### Storage responsibilities

- 👤 User identity and password hash
- 📰 Article storage and deduplication
- 🔖 Saved articles for authenticated users
- 📖 Reading history and interaction signals
- ⚙️ User topic preferences
- 📊 Analytics and recommendation snapshots

---

## 🔌 4. News Integration Module

The application integrates content from multiple external data sources and normalizes them into a single internal article structure.

### Sources

- NewsData
- Currents
- Google News RSS
- Demo fallback content

### Integration flow

```text
News APIs / RSS feeds
         │
         ▼
   Flask Backend
         │
         ├── Fetch
         ├── Normalize
         ├── Validate
         ├── Deduplicate
         └── Sort / Cache
         │
         ▼
       MongoDB
         │
         ▼
   React Frontend
```

---

## 🤖 5. Recommendation Engine

The hybrid recommendation engine combines multiple signals to personalize article discovery.

### Signals used

- 🧠 TF-IDF content similarity
- 👤 User interests
- 📖 Reading behavior
- 🔥 Trending content
- ⏱️ Content recency

### Recommendation weights

- Content: `0.45`
- Interest: `0.25`
- Behavior: `0.15`
- Trending: `0.10`
- Recency: `0.05`

Recommendation responses include `matchScore` and `because_of` for explainability.

---

## 🔐 6. Authentication Module

JWT authentication protects user-specific APIs and supports secure access to bookmarks, history, preferences, and analytics.

### Authentication flow

```text
User
 │
 ▼
Login / Registration
 │
 ▼
Flask Auth Layer
 │
 ▼
Credential Validation
 │
 ▼
JWT Token Issued
 │
 ▼
Protected API Requests
```

JWT protects features such as:

- 🔖 Bookmarks
- 📖 Reading history
- ⚙️ Preferences
- 🤖 Personalized recommendations
- 📊 Analytics

---

## 🔖 7. Bookmark Module

Users can save articles and revisit them later from a protected personal space.

### Workflow

```text
User
 │
 ▼
Select Article
 │
 ▼
Bookmark Article
 │
 ▼
Flask API
 │
 ▼
MongoDB
 │
 ▼
Saved Bookmark
 │
 ▼
Bookmark Page
```

---

## 📖 8. Reading History Module

Reading history tracks how users engage with content and contributes to personalization.

### Workflow

```text
User Opens Article
        │
        ▼
Article Interaction
        │
        ▼
Backend API
        │
        ▼
MongoDB
        │
        ▼
Reading History
        │
        ▼
Recommendation Engine
```

---

## ⚙️ 9. User Preferences Module

Users can configure interests that influence article recommendations and briefing generation.

```text
User
 │
 ▼
Select Interests
 │
 ▼
Preferences API
 │
 ▼
MongoDB
 │
 ▼
Recommendation Engine
 │
 ▼
Personalized News Feed
```

---

## 📊 10. Analytics Module

NewsPulse tracks behavior and generates engagement insights based on user actions.

### Analytics can measure

- 📖 Reading behavior
- 📰 Article interactions
- 👤 Interest preferences
- 🔎 Discovery patterns
- 📈 Content engagement

---

## 📝 11. Summarization Module

The app supports summarization of longer content to make reading faster and clearer.

### Supported content

- 📰 News articles
- 📄 PDF documents
- 📝 Text snippets
- 📅 Daily briefing summaries

---

## 📅 12. Daily Briefing Module

Daily briefings combine relevant, personalized stories into a concise, digestible view.

```text
News Sources
     │
     ▼
Article Processing
     │
     ▼
User Preferences
     │
     ▼
Recommendation Engine
     │
     ▼
Daily Briefing
     │
     ▼
User
```

---

## 🐳 13. Docker Module

NewsPulse is containerized with Docker Compose for easier setup and deployment.

### Docker architecture

```text
┌───────────────────────────────────┐
│          Docker Compose           │
├───────────────────────────────────┤
│   Frontend Container             │
│            │                      │
│            ▼                      │
│   Backend Container              │
│            │                      │
│            ▼                      │
│   MongoDB Service                │
└───────────────────────────────────┘
```

### Start application

```bash
docker compose up --build
```

### Stop application

```bash
docker compose down
```

---

## ⚙️ 14. GitHub Actions CI

The repository includes automated validation for backend tests and frontend build checks.

### CI workflow

```text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    ├── Install dependencies
    ├── Run backend tests
    └── Validate frontend build
```

---

# 🔄 Complete NewsPulse Workflow

```text
                         ┌──────────────────┐
                         │       USER       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ React Frontend   │
                         └────────┬─────────┘
                                  │
                             REST APIs
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Flask Backend    │
                         └────────┬─────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
      ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
      │  News APIs  │     │  RSS Feeds   │     │   MongoDB   │
      └──────┬──────┘     └──────┬───────┘     └──────┬──────┘
             │                   │                    │
             └───────────────────┼────────────────────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │ Data Processing  │
                       └────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       Recommendation    Summarization      Analytics
          Engine             Engine            Engine
              │                 │                 │
              └─────────────────┼─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Personalized     │
                       │ News Experience  │
                       └──────────────────┘
```

---

# 📂 Project Structure

```text
newsr/
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── config.py
│   ├── pdf_extractor.py
│   ├── recommendation_service.py
│   ├── recommender.py
│   ├── storage.py
│   ├── story_detector.py
│   ├── trending_service.py
│   ├── user_profile.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── .github/
│   └── workflows/
├── .env.example
├── docker-compose.yml
├── README.md
├── start-backend.bat
├── start-newsr.bat
├── .gitignore
└── .env
```

---

# 💻 Installation & Setup

## 1️⃣ Clone repository

```bash
git clone https://github.com/anam-tabassum64/Newsr.git
cd Newsr
```

## 2️⃣ Backend setup

```bash
cd backend
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
python app.py
```

## 3️⃣ Frontend setup

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Then open the local URL provided by Vite, typically:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root using the values below:

```env
JWT_SECRET=replace-with-a-random-32-byte-secret
JWT_EXPIRES_HOURS=24
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=newspulse
NEWSDATA_API_KEY=YOUR_NEWSDATA_API_KEY
CURRENTS_API_KEY=YOUR_CURRENTS_API_KEY
MAIL_USERNAME=
MAIL_PASSWORD=
GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
NEWS_CACHE_SECONDS=300
MAX_PDF_BYTES=52428800
STORY_SIMILARITY_THRESHOLD=0.72
STORY_TITLE_THRESHOLD=0.5
WEIGHT_BOOKMARK=5
WEIGHT_LONG_READ=4
WEIGHT_CLICK=2
WEIGHT_SEARCH=3
WEIGHT_CATEGORY_VIEW=1
WEIGHT_SKIP=-1
RECOMMEND_CONTENT_WEIGHT=0.45
RECOMMEND_INTEREST_WEIGHT=0.25
RECOMMEND_BEHAVIOR_WEIGHT=0.15
RECOMMEND_TRENDING_WEIGHT=0.10
RECOMMEND_RECENCY_WEIGHT=0.05
```

> ⚠️ Never commit real API keys, passwords, or secret values to GitHub.

---

# ▶️ Running the Application

## Start backend

From the backend directory:

```bash
python app.py
```

## Start frontend

From the frontend directory:

```bash
npm run dev
```

## Start with Docker

```bash
docker compose up --build
```

Stop with:

```bash
docker compose down
```

---

# 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| 🎨 Frontend | React.js, JavaScript, Vite |
| ⚙️ Backend | Python, Flask |
| 🗄️ Database | MongoDB, PyMongo |
| 🔌 APIs | REST APIs, News APIs, RSS |
| 🤖 Machine Learning | Scikit-learn, TF-IDF |
| 🔐 Authentication | JWT, Werkzeug |
| 🐳 Containerization | Docker, Docker Compose |
| ⚙️ CI | GitHub Actions |
| 🔧 Version Control | Git, GitHub |

---

# 📊 Project Metrics

| Metric | Details |
|---|---|
| 🚀 Data sources | NewsData, Currents, Google News RSS |
| 🔐 Authentication | JWT-based secure user access |
| 📰 News sources | Multiple APIs + RSS feeds |
| 🤖 Recommendation model | Hybrid TF-IDF + behavior-based scoring |
| 🗄️ MongoDB collections | 8 main storage collections |
| 🐳 Deployment | Docker Compose |
| ⚙️ CI | GitHub Actions |

---

# 📸 Screenshots

Add screenshots to a `screenshots/` folder when available.

```markdown
![NewsPulse Home](screenshots/home.png)
![NewsPulse Login](screenshots/login.png)
![NewsPulse Feed](screenshots/news-feed.png)
![NewsPulse Recommendations](screenshots/recommendations.png)
![NewsPulse Bookmarks](screenshots/bookmarks.png)
![NewsPulse Analytics](screenshots/analytics.png)
```

---

# 🎯 Project Highlights

### 💻 Full-stack development

- React frontend
- Flask backend
- REST API architecture
- MongoDB persistence

### 🔌 Data integration

- Multiple news providers
- RSS feed support
- Fallback mechanisms
- Structured article handling

### 🤖 Intelligent personalization

- TF-IDF similarity
- User interest profiling
- Reading behavior tracking
- Trending content scoring
- Recency-aware recommendations

### 🔐 User features

- JWT authentication
- Bookmarking
- Reading history
- Preferences
- Analytics

### 📝 Content intelligence

- News summarization
- PDF and text summarization
- Daily briefings

### 🐳 DevOps

- Docker Compose
- GitHub Actions
- Test automation

---

# 🚀 Future Improvements

- 🔴 Real-time breaking news notifications
- ⚡ Redis caching
- 🔍 Advanced semantic search
- 🤖 Improved recommendation quality
- 📊 Deeper analytics dashboards
- 📡 More news providers and source diversity
- ☁️ Cloud deployment
- 📱 Mobile-first experience improvements
- 🔔 Personalized notifications
- 🧠 More advanced NLP recommendation models

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

### 2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

### 3. Make your changes

### 4. Commit your changes

```bash
git commit -m "Add new feature"
```

### 5. Push the branch

```bash
git push origin feature/new-feature
```

### 6. Open a Pull Request

Suggestions and improvements are encouraged.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

## Anam Tabassum

🎓 Computer Science & Engineering
💻 Full-stack development
📊 Data & analytics
🤖 Machine learning

### 🔗 Connect

- GitHub: `anam-tabassum64`
- LinkedIn: `anam64`

---

⭐ If you found NewsPulse useful, consider giving the repository a star.

<p align="center">
  Made with ❤️ using React, Flask, Python, MongoDB, and machine learning.
</p>
