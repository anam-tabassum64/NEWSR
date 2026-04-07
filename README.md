# NewsPulse

## Project overview

NewsPulse is a full-stack personalized news aggregator built with React and Flask. It fetches topic-based stories from GNews, tracks user clicks for trending insights, and recommends related articles using a simple TF-IDF similarity model.

## Features

- Topic-based news feed with featured story and compact article cards
- Client-side search with debounced input and highlighted matches
- Bookmark saving with localStorage persistence and slide-in drawer
- Reading history chips for quick reopen access
- Personalized recommendations based on clicked articles
- Trending topics powered by in-memory click tracking
- Load more pagination and sortable feed
- Responsive layout with sidebar widgets and toast notifications

## Tech stack

- Frontend: React with Vite
- Styling: Plain CSS
- React APIs: `useState`, `useEffect`, `useRef`, `useCallback`
- Backend: Flask
- CORS: `flask-cors`
- Machine learning: `scikit-learn`
- External API: GNews

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Adding your GNews API key

Open `backend/app.py` and replace the `API_KEY` value on line 10 with your real GNews API key:

```python
API_KEY = "YOUR_GNEWS_API_KEY"
```

## How recommendations work

When you click an article, the backend combines each article title and description into a single text block. It uses TF-IDF to convert those article texts into vectors, then compares the clicked article with the rest using cosine similarity. The most similar articles are returned as recommendations, and the similarity score is converted into a simple 0 to 100 match percentage.

## Project file structure tree

```text
newsr/
|-- backend/
|   |-- app.py
|   |-- recommender.py
|   `-- requirements.txt
|-- frontend/
|   |-- index.html
|   `-- src/
|       |-- App.css
|       |-- App.jsx
|       |-- components/
|       |   |-- ArticleCard.jsx
|       |   |-- BookmarkDrawer.jsx
|       |   |-- FeaturedArticle.jsx
|       |   |-- Header.jsx
|       |   |-- NewsList.jsx
|       |   |-- ReadingHistory.jsx
|       |   |-- Recommendations.jsx
|       |   |-- SearchBar.jsx
|       |   |-- ToastNotification.jsx
|       |   |-- TopicBar.jsx
|       |   `-- TrendingBar.jsx
|       |-- hooks/
|       |   |-- useBookmarks.js
|       |   |-- useNews.js
|       |   `-- useRecommendations.js
|       |-- services/
|       |   `-- api.js
|       `-- utils/
|           |-- formatDate.js
|           `-- highlightText.js
`-- README.md
```
