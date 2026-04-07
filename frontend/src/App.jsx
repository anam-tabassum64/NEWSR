import { useEffect, useRef, useState } from "react";
import "./App.css";
import BookmarkDrawer from "./components/BookmarkDrawer";
import ENewspaper from "./components/ENewspaper";
import FeaturedArticle from "./components/FeaturedArticle";
import Header from "./components/Header";
import LoadingPage from "./components/LoadingPage";
import NewsList from "./components/NewsList";
import PDFSummarizer from "./components/PDFSummarizer";
import ReadingHistory from "./components/ReadingHistory";
import Recommendations from "./components/Recommendations";
import ToastNotification from "./components/ToastNotification";
import TopicBar from "./components/TopicBar";
import TrendingBar from "./components/TrendingBar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useBookmarks } from "./hooks/useBookmarks";
import { useNews } from "./hooks/useNews";
import { useRecommendations } from "./hooks/useRecommendations";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { fetchTrending, trackClick } from "./services/api";

const TOPICS = [
  "All",
  "AI",
  "Technology",
  "Business",
  "Startups",
  "Politics",
  "World",
  "Crypto",
  "Sports",
  "Science",
  "Health",
];

function openArticleWindow(article) {
  try {
    const articleUrl = new URL(article.url);
    window.open(articleUrl.toString(), "_blank", "noopener,noreferrer");
    return true;
  } catch (error) {
    return false;
  }
}

function mergeByUrl(primary = [], secondary = []) {
  const merged = [...primary, ...secondary];
  const seen = new Set();

  return merged.filter((item) => {
    if (!item?.url || seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
}

function AppContent() {
  const { user, loading: authLoading, updatePreferences } = useAuth();
  const [topic, setTopic] = useState("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSortBy, setActiveSortBy] = useState("latest");
  const [readingHistory, setReadingHistory] = useState([]);
  const [bookmarkDrawerOpen, setBookmarkDrawerOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const [pathname, setPathname] = useState(window.location.pathname);
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
    setClickHistory,
    addToHistory,
  } = useRecommendations();
  const { bookmarks, setBookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const trendingIntervalRef = useRef(null);
  const hydratedUserRef = useRef("");
  const syncTimeoutRef = useRef(null);

  function showToast(message, type = "info") {
    setToast({
      message,
      type,
      visible: true,
    });
  }

  function navigate(nextPath) {
    window.history.pushState({}, "", nextPath);
    setPathname(nextPath);
  }

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

    function handlePopState() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      if (trendingIntervalRef.current) {
        window.clearInterval(trendingIntervalRef.current);
      }
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!user?.email) {
      hydratedUserRef.current = "";
      return;
    }

    if (hydratedUserRef.current === user.email) {
      return;
    }

    const storedPrefs = user.preferences || {};
    const mergedBookmarks = mergeByUrl(storedPrefs.bookmarks || [], bookmarks);
    const mergedHistory = mergeByUrl(storedPrefs.click_history || [], clickHistory).slice(0, 10);

    setBookmarks(mergedBookmarks);
    setClickHistory(mergedHistory);
    setReadingHistory(mergedHistory);
    hydratedUserRef.current = user.email;
  }, [user, bookmarks, clickHistory, setBookmarks, setClickHistory]);

  useEffect(() => {
    if (!user?.email || hydratedUserRef.current !== user.email) {
      return undefined;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      updatePreferences({
        ...(user.preferences || {}),
        topics: [topic],
        languages: user.preferences?.languages || [],
        bookmarks,
        click_history: clickHistory,
      }).catch(() => {
        // Preference syncing should stay silent in the background.
      });
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, topic, bookmarks, clickHistory, updatePreferences]);

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
      showToast("This article link is not available.", "info");
      return;
    }

    if (article.isFallback) {
      showToast("Opening the publisher site because this card is demo content.", "info");
    }

    try {
      await trackClick(article, topic);
    } catch (requestError) {
      // Tracking failure should not block reading.
    }

    const updatedClickHistory = addToHistory(article);
    setReadingHistory(updatedClickHistory);

    await getRecommendations(article, articles, updatedClickHistory);
    refreshTrending();
  }

  function handleBookmark(article) {
    const added = toggleBookmark(article);
    showToast(added ? "Saved!" : "Removed", added ? "success" : "info");
  }

  function handleLoadMore() {
    fetchPage(page + 1);
  }

  if (authLoading) {
    return <LoadingPage />;
  }

  if (pathname === "/reset-password") {
    return <ResetPasswordPage />;
  }

  return (
    <div className="app-shell">
      <Header
        onSearch={setSearchQuery}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setBookmarkDrawerOpen(true)}
        initialQuery={searchQuery}
        onOpenProfile={() => navigate("/profile")}
        onShowToast={showToast}
      />

      {pathname === "/profile" ? (
        <main className="stacked-sections profile-shell">
          <ProfilePage onBackHome={() => navigate("/")} />
        </main>
      ) : (
        <>
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
        </>
      )}

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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
