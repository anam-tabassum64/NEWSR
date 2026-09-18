````markdown
# 📰 Newsr – Personalized News Aggregator

[![React.js](https://img.shields.io/badge/React.js-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PyMongo](https://img.shields.io/badge/PyMongo-Driver-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://pymongo.readthedocs.io/)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)

> 📰 **Personalized news. Smarter discovery. One unified platform.**

---

## 📌 Overview

**Newsr** is a full-stack personalized news intelligence platform designed to bring news from multiple sources into one unified application.

The platform combines a **React.js frontend**, **Flask/Python backend**, **MongoDB database**, **REST APIs**, and **machine learning** to provide personalized news discovery and intelligent content management.

Newsr integrates multiple **News APIs and RSS feeds**, processes incoming content, and uses user interests and reading behavior to improve article discovery.

The platform provides features such as:

- 📰 Multi-source news aggregation
- 🤖 Personalized recommendations
- 🔐 JWT authentication
- 🔖 Bookmarking
- 📖 Reading history
- ⚙️ Personalized preferences
- 📊 Analytics
- 📝 News summarization
- 📅 Daily briefings
- 📄 PDF/text summarization
- 🐳 Docker-based containerization
- ⚙️ Automated testing with GitHub Actions

---

# ✨ Features

| 🚀 Feature | 🔹 Description |
|---|---|
| 📰 **Multi-Source News** | Aggregates news from multiple News APIs and RSS feeds |
| 🤖 **Personalized Recommendations** | Recommends articles using content similarity, interests, reading behavior, trends, and recency |
| 🔐 **JWT Authentication** | Provides secure authentication and protected API access |
| 🔖 **Bookmarking** | Allows users to save articles for later |
| 📖 **Reading History** | Tracks previously read articles |
| ⚙️ **User Preferences** | Personalizes content based on user interests |
| 📊 **Analytics** | Provides insights based on user interaction and reading behavior |
| 📝 **News Summarization** | Generates concise summaries from supported content |
| 📅 **Daily Briefings** | Provides personalized daily news briefings |
| 📄 **PDF/Text Summarization** | Supports summarization of PDF and text content |
| 🔄 **Fallback Handling** | Maintains content availability when external sources fail |
| 🐳 **Docker Support** | Containerized application using Docker Compose |
| ⚙️ **GitHub Actions** | Automated testing and CI workflow |

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────────┐
                         │       NEWS SOURCES       │
                         │                          │
                         │   News APIs + RSS Feeds  │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │      FLASK BACKEND       │
                         │                          │
                         │      REST APIs           │
                         │      Authentication      │
                         │      Data Processing     │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
     ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
     │     MongoDB     │    │ Recommendation  │    │ Summarization   │
     │    Database     │    │     Engine      │    │     Engine      │
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
````

---

# 🧩 Project Modules

## 🎨 1. Frontend Module

The frontend is developed using **React.js and JavaScript**.

It provides the user-facing interface for interacting with Newsr.

### Responsibilities

* 📰 Display personalized news
* 🔍 Search and discover articles
* 📑 Display article details
* 🔖 Manage bookmarks
* 📖 Display reading history
* ⚙️ Manage user preferences
* 📊 Display analytics
* 📝 Access summaries
* 📅 Access daily briefings
* 🔐 Handle authentication state
* 🔄 Communicate with backend REST APIs

### Frontend Flow

```text
User
 │
 ▼
React.js Frontend
 │
 ├── Home / News Feed
 ├── Search
 ├── Article Details
 ├── Bookmarks
 ├── Reading History
 ├── Preferences
 ├── Analytics
 └── Summaries
 │
 ▼
REST APIs
```

---

# ⚙️ 2. Backend Module

The backend is developed using **Python and Flask**.

It acts as the central application layer between the frontend, database, recommendation engine, summarization functionality, and external news sources.

Newsr contains **22 REST API endpoints**.

### Responsibilities

* 🔐 Authentication
* 👤 User management
* 📰 News retrieval
* 🔌 External API integration
* 📡 RSS feed processing
* 🔖 Bookmark management
* 📖 Reading history
* ⚙️ User preferences
* 🤖 Recommendation processing
* 📝 Summarization
* 📅 Daily briefing generation
* 📊 Analytics

### Backend Flow

```text
React Frontend
       │
       │ HTTP Requests
       ▼
┌─────────────────────┐
│    Flask Backend    │
├─────────────────────┤
│ Authentication      │
│ News APIs           │
│ RSS Integration     │
│ Recommendations     │
│ Summarization       │
│ Bookmarks           │
│ Reading History     │
│ Preferences         │
│ Analytics           │
└──────────┬──────────┘
           │
           ▼
       MongoDB
```

---

# 🗄️ 3. Database Module

Newsr uses **MongoDB** for persistent data storage and **PyMongo** as the Python database driver.

The application uses **8 MongoDB collections**.

### Database Responsibilities

* 👤 User information
* 📰 News/article data
* 🔖 Bookmarks
* 📖 Reading history
* ⚙️ User preferences
* 📊 Analytics
* 🤖 Recommendation-related data
* 💾 Persistent application data

### Database Flow

```text
                    MongoDB
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
    Users           Articles       Bookmarks
       │               │               │
       ▼               ▼               ▼
 Preferences      History        Analytics
       │
       ▼
 Recommendations
```

---

# 🔌 4. News Integration Module

Newsr integrates news content from **multiple News APIs and RSS feeds**.

The backend collects, processes, and normalizes incoming content before making it available to the frontend.

### Integration Flow

```text
┌──────────────────┐
│    News APIs     │
└────────┬─────────┘
         │
         │
┌────────▼─────────┐
│    RSS Feeds     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Flask Backend   │
├──────────────────┤
│ Fetch            │
│ Process          │
│ Normalize        │
│ Filter           │
└────────┬─────────┘
         │
         ▼
      MongoDB
         │
         ▼
   React Frontend
```

### Integration Capabilities

* 🔗 Multiple external news sources
* 📡 RSS feed support
* 🔄 Fallback data handling
* 🧹 Content processing
* 📦 Structured article data
* 🔌 REST-based communication

---

# 🤖 5. Recommendation Engine

Newsr uses a **hybrid recommendation engine** to personalize article discovery.

Instead of relying on a single signal, the system combines multiple factors.

### Recommendation Signals

* 🧠 TF-IDF content similarity
* 👤 User interests
* 📖 Reading behavior
* 🔥 Trending content
* ⏱️ Content recency

### Recommendation Pipeline

```text
                 News Articles
                      │
                      ▼
              Content Processing
                      │
                      ▼
              TF-IDF Vectorization
                      │
                      ▼
              Content Similarity
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
User Interests   Reading History   Trending Content
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
                Recency Signal
                      │
                      ▼
              Hybrid Recommendation
                      │
                      ▼
             Personalized Articles
```

---

# 🔐 6. Authentication Module

Newsr implements **JWT (JSON Web Token) authentication** for secure user-specific functionality.

### Authentication Flow

```text
User
 │
 ▼
Login / Registration
 │
 ▼
Flask Authentication API
 │
 ▼
Credential Validation
 │
 ▼
JWT Token Generated
 │
 ▼
Authenticated Session
 │
 ▼
Protected API Requests
```

JWT authentication supports functionality such as:

* 🔖 Bookmarks
* 📖 Reading history
* ⚙️ Preferences
* 🤖 Personalized recommendations
* 📊 Analytics

---

# 🔖 7. Bookmark Module

The bookmark system allows users to save articles for future reading.

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

### Capabilities

* Save articles
* Retrieve saved articles
* Manage bookmarked content
* Associate bookmarks with authenticated users

---

# 📖 8. Reading History Module

Newsr tracks user reading activity.

Reading history can also contribute to personalized content discovery.

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

# ⚙️ 9. User Preferences Module

Users can configure their interests and preferences.

These preferences become one of the signals used by the recommendation engine.

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

# 📊 10. Analytics Module

Newsr provides analytics based on user interaction with the platform.

Analytics can be used to understand:

* 📖 Reading behavior
* 📰 Article interaction
* 👤 User preferences
* 🔎 News discovery
* 📈 Engagement patterns

### Analytics Flow

```text
User Activity
      │
      ▼
Activity Tracking
      │
      ▼
MongoDB
      │
      ▼
Analytics Processing
      │
      ▼
Analytics Dashboard
```

---

# 📝 11. Summarization Module

Newsr provides summarization functionality to make lengthy content easier to consume.

The platform supports:

* 📰 News summarization
* 📄 PDF summarization
* 📝 Text summarization
* 📅 Daily briefings

### Summarization Flow

```text
Article / Text / PDF
         │
         ▼
   Content Extraction
         │
         ▼
    Summarization
         │
         ▼
   Concise Output
         │
         ▼
       User
```

---

# 📅 12. Daily Briefing Module

Newsr provides a daily briefing experience by combining relevant news content into a concise format.

### Flow

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

# 🐳 13. Docker Module

Newsr is containerized using **Docker Compose**.

Docker provides a consistent environment for running the application and its services.

### Docker Architecture

```text
┌───────────────────────────────────┐
│          Docker Compose           │
├───────────────────────────────────┤
│                                   │
│     Frontend Container            │
│             │                     │
│             ▼                     │
│     Backend Container             │
│             │                     │
│             ▼                     │
│     Application Services          │
│                                   │
└───────────────────────────────────┘
```

### Start Application

```bash
docker compose up --build
```

### Stop Application

```bash
docker compose down
```

---

# ⚙️ 14. GitHub Actions CI

Newsr uses **GitHub Actions** for automated testing and continuous integration.

### CI Workflow

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
    │
    ├── Install Dependencies
    │
    ├── Run Tests
    │
    └── Validate Application
```

This helps automatically validate changes pushed to the repository.

---

# 🔄 Complete Newsr Workflow

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
Newsr/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── ...
│
├── .github/
│   └── workflows/
│
├── requirements.txt
├── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

> ⚠️ Update this structure if your actual repository uses different folder names.

---

# 💻 Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/anam-tabassum64/Newsr.git
cd Newsr
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3️⃣ Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file in the backend according to the configuration used by your project.

Example:

```env
MONGO_URI=your_mongodb_connection_string

NEWSDATA_API_KEY=your_newsdata_api_key
CURRENTS_API_KEY=your_currents_api_key

JWT_SECRET_KEY=your_secret_key

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

> ⚠️ Never commit API keys, passwords, database credentials, or secret keys to GitHub.

---

# ▶️ Running the Application

## Start Backend

From the backend directory:

```bash
python app.py
```

---

## Start Frontend

From the frontend directory:

```bash
npm run dev
```

Then open the local URL provided by the frontend development server.

---

# 🐳 Running with Docker

Build and start the application:

```bash
docker compose up --build
```

Stop the application:

```bash
docker compose down
```

---

# 🛠️ Technology Stack

| Category            | Technologies           |
| ------------------- | ---------------------- |
| 🎨 Frontend         | React.js, JavaScript   |
| ⚙️ Backend          | Python, Flask          |
| 🗄️ Database        | MongoDB, PyMongo       |
| 🔌 APIs             | REST APIs, News APIs   |
| 📡 Data Sources     | RSS Feeds              |
| 🤖 Machine Learning | Scikit-learn, TF-IDF   |
| 🔐 Authentication   | JWT                    |
| 🐳 Containerization | Docker, Docker Compose |
| ⚙️ CI               | GitHub Actions         |
| 🔧 Version Control  | Git, GitHub            |

---

# 📊 Project Metrics

| Metric                  | Details                 |
| ----------------------- | ----------------------- |
| 🚀 REST API Endpoints   | **22**                  |
| 🗄️ MongoDB Collections | **8**                   |
| 🔐 Authentication       | **JWT**                 |
| 📰 News Sources         | **Multiple APIs + RSS** |
| 🤖 Recommendation       | **Hybrid TF-IDF based** |
| 🐳 Containerization     | **Docker Compose**      |
| ⚙️ CI                   | **GitHub Actions**      |

---

# 📸 Screenshots

Add your project screenshots inside a `screenshots/` directory.

### 🏠 Home Page

```markdown
![Newsr Home](screenshots/home.png)
```

### 🔐 Login

```markdown
![Newsr Login](screenshots/login.png)
```

### 📰 News Feed

```markdown
![Newsr News Feed](screenshots/news-feed.png)
```

### 🤖 Recommendations

```markdown
![Newsr Recommendations](screenshots/recommendations.png)
```

### 🔖 Bookmarks

```markdown
![Newsr Bookmarks](screenshots/bookmarks.png)
```

### 📊 Analytics

```markdown
![Newsr Analytics](screenshots/analytics.png)
```

---

# 🎯 Project Highlights

### 💻 Full-Stack Development

* React.js frontend
* Flask/Python backend
* REST API architecture
* MongoDB persistence

### 🔌 Data Integration

* Multiple News APIs
* RSS feed integration
* External API handling
* Fallback mechanisms

### 🤖 Intelligent Personalization

* TF-IDF content similarity
* User interests
* Reading behavior
* Trending content
* Recency-based signals

### 🔐 User Features

* JWT authentication
* Bookmarking
* Reading history
* Personalized preferences
* Analytics

### 📝 Content Intelligence

* News summarization
* PDF/text summarization
* Daily briefings

### 🐳 DevOps

* Docker Compose
* GitHub Actions
* Automated testing

---

# 🚀 Future Improvements

* 🔴 Real-time breaking news notifications
* ⚡ Redis caching
* 🔍 Advanced semantic search
* 🤖 Improved recommendation personalization
* 📊 Recommendation evaluation metrics
* 📡 Additional news providers
* ☁️ Cloud deployment
* 📱 Improved mobile responsiveness
* 🔔 Personalized notifications
* 🧠 More advanced NLP-based recommendations

---

# 🤝 Contributing

Contributions are welcome!

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

### 5. Push your branch

```bash
git push origin feature/new-feature
```

### 6. Open a Pull Request

Suggestions, improvements, and feedback are welcome.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👩‍💻 Author

## Anam Tabassum

🎓 Computer Science & Engineering
💻 Full-Stack Development
📊 Data & Analytics
🤖 Machine Learning

### 🔗 Connect

* GitHub: `anam-tabassum64`
* LinkedIn: `anam64`

---

⭐ **If you found Newsr useful, consider giving the repository a star!**

<p align="center">
  Made with ❤️ using React, Flask, Python, MongoDB & Machine Learning
</p>
```


