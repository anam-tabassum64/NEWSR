import { useEffect, useRef, useState } from "react";
import "./App.css";
import BookmarkDrawer from "./components/BookmarkDrawer";
import AnalyticsPanel from "./components/AnalyticsPanel";
import ArticleTools from "./components/ArticleTools";
import DailyBriefing from "./components/DailyBriefing";
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
import LandingPage from "./pages/LandingPage";
import { fetchTrending, trackClick, trackInteraction, trackReading } from "./services/api";

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
  const [showIntro, setShowIntro] = useState(() => sessionStorage.getItem("newspulse_intro_seen") !== "true");
  const [topic, setTopic] = useState("ai");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSortBy, setActiveSortBy] = useState("latest");
  const [readingHistory, setReadingHistory] = useState([]);
  const [bookmarkDrawerOpen, setBookmarkDrawerOpen] = useState(() => window.location.hash === "#bookmarks");
  const [trending, setTrending] = useState([]);
  const [articleToolsTarget, setArticleToolsTarget] = useState(null);
  const [pathname, setPathname] = useState(() => `${window.location.pathname}${window.location.hash}`);
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
  const readingSessionRef = useRef(null);

  useEffect(() => {
    if (authLoading || !showIntro) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      sessionStorage.setItem("newspulse_intro_seen", "true");
      setShowIntro(false);
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [authLoading, showIntro]);

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

  useEffect(() => {
    const targetId = window.location.hash.slice(1);

    if (!targetId) {
      return;
    }

    if (targetId === "bookmarks") {
      setBookmarkDrawerOpen(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

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
      setPathname(`${window.location.pathname}${window.location.hash}`);
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
    async function finishReadingSession(force = false) {
      const session = readingSessionRef.current;
      if (!session || (!force && document.visibilityState !== "visible")) {
        return;
      }
      readingSessionRef.current = null;
      const durationSeconds = Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));
      await trackReading(session.article, session.topic, durationSeconds, force);
    }

    const handleVisibilityChange = () => finishReadingSession(false);
    const handlePageHide = () => finishReadingSession(true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
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
    trackInteraction("category_view", nextTopic).catch(() => {});
  }

  function handleSearch(nextQuery) {
    setSearchQuery(nextQuery);
    if (nextQuery) {
      trackInteraction("search", topic, nextQuery).catch(() => {});
    }
  }

  function handleArticleSkip() {
    trackInteraction("skip", topic).catch(() => {});
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

    readingSessionRef.current = { article, topic, startedAt: Date.now() };

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
    trackClick(article, topic, 0, "bookmark").catch(() => {});
    showToast(added ? "Saved!" : "Removed", added ? "success" : "info");
  }

  function handleLoadMore() {
    fetchPage(page + 1);
  }

  if (authLoading || showIntro) {
    return <LoadingPage />;
  }

  const routePath = pathname.split("#")[0].split("?")[0];

  if (routePath === "/reset-password") {
    return <ResetPasswordPage />;
  }

  if (routePath === "/") {
    return <LandingPage onExplore={() => navigate("/app")} onFeatureOpen={navigate} />;
  }

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="app-shell">
      <Header
        onSearch={handleSearch}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setBookmarkDrawerOpen(true)}
        initialQuery={searchQuery}
        onOpenProfile={() => navigate("/profile")}
        onShowToast={showToast}
      />

      {routePath === "/profile" ? (
        <main className="stacked-sections profile-shell">
          <ProfilePage onBackHome={() => navigate("/")} />
          <div id="analytics"><AnalyticsPanel /></div>
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

          <section className="feed-intro" aria-labelledby="feed-title">
            <div>
              <p className="feed-intro__eyebrow"><span aria-hidden="true" /> Your daily signal</p>
              <h1 id="feed-title">NEWS, WITH<br />MORE MEANING.</h1>
              <p className="feed-intro__copy">A focused view of the stories shaping your world, curated around what you follow.</p>
            </div>
            <aside className="feed-intro__date"><span>Today</span><strong>{today}</strong><em>Live updates</em></aside>
          </section>

          <section id="history"><ReadingHistory history={readingHistory} onOpenArticle={openArticleWindow} /></section>
          <DailyBriefing />
          {articleToolsTarget ? (
            <ArticleTools article={articleToolsTarget} onClose={() => setArticleToolsTarget(null)} />
          ) : null}

          <main className="main-layout">
            <section className="feed" id="feed">
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
                onArticleTools={setArticleToolsTarget}
                onSkip={handleArticleSkip}
                searchQuery={searchQuery}
                onBookmark={handleBookmark}
                isBookmarked={isBookmarked}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            </section>

            <aside className="sidebar" id="trending">
              <TrendingBar trending={trending} />
              <Recommendations
                recommendations={recommendations}
                loading={recoLoading}
                clickHistory={clickHistory.slice(0, 3)}
                onArticleOpen={openArticleWindow}
              />
            </aside>
          </main>

          <div className="stacked-sections" id="summarizer">
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
