import { useCallback, useState } from "react";
import { fetchRecommendations } from "../services/api";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clickHistory, setClickHistory] = useState([]);

  const getRecommendations = useCallback(async (article, articles, history) => {
    setLoading(true);

    try {
      const data = await fetchRecommendations(article, articles, history);
      setRecommendations(data);
      return data;
    } catch (error) {
      setRecommendations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
  }, []);

  const addToHistory = useCallback((article) => {
    let nextHistory = [];

    setClickHistory((current) => {
      nextHistory = [article, ...current.filter((item) => item.url !== article.url)].slice(0, 10);
      return nextHistory;
    });

    return nextHistory;
  }, []);

  return {
    recommendations,
    loading,
    getRecommendations,
    clearRecommendations,
    clickHistory,
    addToHistory,
  };
}
