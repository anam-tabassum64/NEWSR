import { getFallbackNews } from "../data/fallbackNews";
import { summarizeTextLocally } from "../utils/localSummary";

const BASE_URL = "http://localhost:5000";

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const data = await response.json();
      message = data.error || fallbackMessage;
    } catch (error) {
      message = fallbackMessage;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchNews(topic, page = 1, sortBy = "latest") {
  try {
    const response = await fetch(
      `${BASE_URL}/news?topic=${encodeURIComponent(topic)}&page=${page}&sortBy=${encodeURIComponent(sortBy)}`
    );

    return await handleResponse(response, "Failed to load news. Please try again.");
  } catch (error) {
    return getFallbackNews(topic, page, sortBy);
  }
}

export async function fetchRecommendations(clickedArticle, articles, history) {
  try {
    const response = await fetch(`${BASE_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clicked: clickedArticle,
        articles,
        history,
      }),
    });

    return await handleResponse(response, "Failed to load recommendations.");
  } catch (error) {
    return [];
  }
}

export async function trackClick(article, topic) {
  try {
    const response = await fetch(`${BASE_URL}/track_click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        article,
        topic,
      }),
    });

    return await handleResponse(response, "Failed to track article click.");
  } catch (error) {
    return { history: [] };
  }
}

export async function fetchTrending() {
  try {
    const response = await fetch(`${BASE_URL}/trending`);
    return await handleResponse(response, "Failed to load trending topics.");
  } catch (error) {
    return [];
  }
}

export async function summarizeContent({ file, text }) {
  if (text?.trim()) {
    try {
      const formData = new FormData();
      formData.append("text", text.trim());

      const response = await fetch(`${BASE_URL}/summarize`, {
        method: "POST",
        body: formData,
      });

      return await handleResponse(response, "Failed to summarize content.");
    } catch (error) {
      return summarizeTextLocally(text);
    }
  }

  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BASE_URL}/summarize`, {
        method: "POST",
        body: formData,
      });

      return await handleResponse(response, "Failed to summarize content.");
    } catch (error) {
      throw new Error("PDF summarization needs the backend server running on http://localhost:5000.");
    }
  }

  throw new Error("Upload a PDF or paste text to summarize.");
}
