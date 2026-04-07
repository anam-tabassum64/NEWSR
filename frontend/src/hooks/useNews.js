import { useCallback, useEffect, useState } from "react";
import { getFallbackNews } from "../data/fallbackNews";
import { fetchNews } from "../services/api";

function getArticleIdentity(article) {
  return article.id ?? `${article.url || "article"}-${article.title || "title"}-${article.publishedAt || "time"}`;
}

export function useNews(topic, sortBy = "latest") {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchNews(topic, pageNumber, sortBy);
        const safeData = data.length ? data : getFallbackNews(topic, pageNumber, sortBy);

        setArticles((current) => {
          if (pageNumber === 1) {
            return safeData;
          }

          const existingIds = new Set(current.map(getArticleIdentity));
          const appended = safeData.filter((item) => !existingIds.has(getArticleIdentity(item)));
          return [...current, ...appended];
        });
        setPage(pageNumber);
        setHasMore(safeData.length >= 12);
      } catch (requestError) {
        const fallbackData = getFallbackNews(topic, pageNumber, sortBy);
        setError("");
        setArticles((current) => {
          if (pageNumber === 1) {
            return fallbackData;
          }

          const existingIds = new Set(current.map(getArticleIdentity));
          const appended = fallbackData.filter((item) => !existingIds.has(getArticleIdentity(item)));
          return [...current, ...appended];
        });
        setHasMore(fallbackData.length >= 12);
      } finally {
        setLoading(false);
      }
    },
    [topic, sortBy]
  );

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1);
  }, [fetchPage]);

  return { articles, loading, error, fetchPage, page, hasMore };
}
