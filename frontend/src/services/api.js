// FILE: frontend/src/services/api.js
import { getFallbackNews } from "../data/fallbackNews";
import { summarizeTextLocally } from "../utils/localSummary";

const BASE_URL = "http://localhost:5000";

function createNetworkError(fallbackMessage) {
  return new Error(`${fallbackMessage} Make sure the backend is running on ${BASE_URL}.`);
}

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    try {
      const data = await response.json();
      throw new Error(data.error || fallbackMessage);
    } catch (error) {
      if (error instanceof Error && error.name !== "SyntaxError") {
        throw error;
      }
      throw new Error(fallbackMessage);
    }
  }

  return response.json();
}

export function getAuthHeader() {
  const token = localStorage.getItem("newspulse_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postJson(path, body, fallbackMessage, extraHeaders = {}) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: JSON.stringify(body ?? {}),
    });

    return handleResponse(response, fallbackMessage);
  } catch (error) {
    throw createNetworkError(fallbackMessage);
  }
}

export async function authRegister(name, email, password) {
  return postJson(
    "/auth/register",
    { name, email, password },
    "Unable to create your account right now."
  );
}

export async function authLogin(email, password) {
  return postJson("/auth/login", { email, password }, "Unable to sign in right now.");
}

export async function authLogout() {
  return postJson("/auth/logout", {}, "Unable to sign out right now.", getAuthHeader());
}

export async function authForgotPassword(email) {
  return postJson("/auth/forgot-password", { email }, "Unable to start password reset.");
}

export async function authResetPassword(token, newPassword) {
  return postJson(
    "/auth/reset-password",
    { token, new_password: newPassword },
    "Unable to reset your password."
  );
}

export async function authGetMe() {
  try {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        ...getAuthHeader(),
      },
    });

    return handleResponse(response, "Unable to restore your session.");
  } catch (error) {
    throw createNetworkError("Unable to restore your session.");
  }
}

export async function authUpdatePreferences(prefs) {
  try {
    const response = await fetch(`${BASE_URL}/auth/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(prefs ?? {}),
    });

    return handleResponse(response, "Unable to update your preferences.");
  } catch (error) {
    throw createNetworkError("Unable to update your preferences.");
  }
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
