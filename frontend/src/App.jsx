import { useEffect, useRef, useState } from "react";
import "./App.css";
import BookmarkDrawer from "./components/BookmarkDrawer";
import ENewspaper from "./components/ENewspaper";
import FeaturedArticle from "./components/FeaturedArticle";
import Header from "./components/Header";
import NewsList from "./components/NewsList";
import PDFSummarizer from "./components/PDFSummarizer";
import ReadingHistory from "./components/ReadingHistory";
import Recommendations from "./components/Recommendations";
import ToastNotification from "./components/ToastNotification";
import TopicBar from "./components/TopicBar";
import TrendingBar from "./components/TrendingBar";
import { useBookmarks } from "./hooks/useBookmarks";
import { useNews } from "./hooks/useNews";
import { useRecommendations } from "./hooks/useRecommendations";
import { fetchTrending, trackClick } from "./services/api";

const TOPICS = ["All", "AI", "Technology", "Business", "Sports", "Science", "Health"];

function openArticleWindow(article) {
  try {
    const articleUrl = new URL(article.url);
    window.open(articleUrl.toString(), "_blank", "noopener,noreferrer");
    return true;
  } catch (error) {
    return false;
  }
}

function App() {
  const [topic, setTopic] = useState("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSortBy, setActiveSortBy] = useState("latest");
  const [readingHistory, setReadingHistory] = useState([]);
  const [bookmarkDrawerOpen, setBookmarkDrawerOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const [toast, setToast] = useState({
    message: "",
    type: "info",
    visible: false,
  });

  const { articles, loading, error, fetchPage, page, hasMore } = useNews(topic, activeSortBy);
  const {
    recommendations,
    loading: recoLoading,
    getRecommendations,
    clearRecommendations,
    clickHistory,
    addToHistory,
  } = useRecommendations();
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const trendingIntervalRef = useRef(null);

  async function refreshTrending() {
    try {
      const data = await fetchTrending();
      setTrending(data);
    } catch (requestError) {
      setTrending([]);
    }
  }

  useEffect(() => {
    refreshTrending();
    trendingIntervalRef.current = window.setInterval(refreshTrending, 60000);

    return () => {
      if (trendingIntervalRef.current) {
        window.clearInterval(trendingIntervalRef.current);
      }
    };
  }, []);

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const haystack = `${article.title} ${article.description}`.toLowerCase();
    return haystack.includes(query);
  });

  const featuredArticle = filteredArticles[0] || null;
  const remainingArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : filteredArticles;

  function handleTopicChange(nextTopic) {
    setTopic(nextTopic);
    setSearchQuery("");
    clearRecommendations();
  }

  function handleSortChange(value) {
    setActiveSortBy(value);
    clearRecommendations();
  }

  async function handleArticleClick(article) {
    const opened = openArticleWindow(article);

    if (!opened) {
      setToast({
        message: "This article link is not available.",
        type: "info",
        visible: true,
      });
      return;
    }

    try {
      await trackClick(article, topic);
    } catch (error) {
      // Tracking failure should not block reading.
    }

    const updatedClickHistory = addToHistory(article);

    await getRecommendations(article, articles, updatedClickHistory);
    refreshTrending();

    setReadingHistory((current) => {
      const nextItems = [
        { title: article.title, topic, url: article.url, image: article.image, description: article.description },
        ...current.filter((item) => item.url !== article.url),
      ];
      return nextItems.slice(0, 10);
    });
  }

  function handleBookmark(article) {
    const added = toggleBookmark(article);
    setToast({
      message: added ? "Saved!" : "Removed",
      type: added ? "success" : "info",
      visible: true,
    });
  }

  function handleLoadMore() {
    fetchPage(page + 1);
  }

  return (
    <div className="app-shell">
      <Header
        onSearch={setSearchQuery}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setBookmarkDrawerOpen(true)}
        initialQuery={searchQuery}
      />

      <TopicBar
        topics={TOPICS}
        activeTopic={topic}
        onTopicChange={handleTopicChange}
        sortBy={activeSortBy}
        onSortChange={handleSortChange}
      />

      <ReadingHistory history={readingHistory} onOpenArticle={openArticleWindow} />

      <main className="main-layout">
        <section className="feed">
          {error ? <p className="error-banner">{error}</p> : null}

          {featuredArticle ? (
            <FeaturedArticle
              article={featuredArticle}
              onBookmark={handleBookmark}
              isBookmarked={isBookmarked}
              onArticleClick={handleArticleClick}
            />
          ) : null}

          <NewsList
            articles={remainingArticles}
            loading={loading}
            onArticleClick={handleArticleClick}
            searchQuery={searchQuery}
            onBookmark={handleBookmark}
            isBookmarked={isBookmarked}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </section>

        <aside className="sidebar">
          <TrendingBar trending={trending} />
          <Recommendations
            recommendations={recommendations}
            loading={recoLoading}
            clickHistory={clickHistory.slice(0, 3)}
            onArticleOpen={openArticleWindow}
          />
        </aside>
      </main>

      <div className="stacked-sections">
        <ENewspaper />
        <PDFSummarizer />
      </div>

      <BookmarkDrawer
        bookmarks={bookmarks}
        isOpen={bookmarkDrawerOpen}
        onClose={() => setBookmarkDrawerOpen(false)}
        onRemove={handleBookmark}
        onOpenArticle={openArticleWindow}
      />

      <ToastNotification
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </div>
  );
}

export default App;
