import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "newspulse-bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      setBookmarks([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const replaceBookmarks = useCallback((nextBookmarks) => {
    setBookmarks(Array.isArray(nextBookmarks) ? nextBookmarks : []);
  }, []);

  const toggleBookmark = useCallback((article) => {
    let added = false;

    setBookmarks((current) => {
      const exists = current.some((item) => item.url === article.url);

      if (exists) {
        return current.filter((item) => item.url !== article.url);
      }

      added = true;
      return [article, ...current];
    });

    return added;
  }, []);

  const isBookmarked = useCallback(
    (url) => bookmarks.some((item) => item.url === url),
    [bookmarks]
  );

  return { bookmarks, setBookmarks: replaceBookmarks, toggleBookmark, isBookmarked };
}
