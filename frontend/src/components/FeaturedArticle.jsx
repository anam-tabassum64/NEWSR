import { useEffect, useState } from "react";
import { formatDate } from "../utils/formatDate";

function FeaturedArticle({ article, onBookmark, isBookmarked, onArticleClick }) {
  if (!article) {
    return null;
  }

  const bookmarked = isBookmarked(article.url);
  const [imageVisible, setImageVisible] = useState(Boolean(article.image));

  useEffect(() => {
    setImageVisible(Boolean(article.image));
  }, [article.image]);

  return (
    <article
      className="card featured-article"
      onClick={() => onArticleClick(article)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onArticleClick(article);
        }
      }}
    >
      <div className="featured-article__media">
        {imageVisible ? (
          <img
            src={article.image}
            alt={article.title}
            className="featured-article__image"
            loading="eager"
            referrerPolicy="no-referrer"
            onError={() => setImageVisible(false)}
          />
        ) : (
          <div className="featured-article__placeholder" aria-hidden="true">
            <span>NEWSR</span>
          </div>
        )}
        <div className="featured-article__overlay" />
        <span className="featured-article__badge">Breaking</span>
        <button
          type="button"
          className="bookmark-toggle featured-article__bookmark"
          aria-label={bookmarked ? "Remove bookmark" : "Save article"}
          onClick={(event) => {
            event.stopPropagation();
            onBookmark(article);
          }}
        >
          {bookmarked ? "Saved" : "Save"}
        </button>
      </div>

      <div className="featured-article__content">
        <div className="featured-article__meta">
          <span className="source-pill">{article.source}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
        <h2>{article.title}</h2>
        <p>{article.description}</p>
      </div>
    </article>
  );
}

export default FeaturedArticle;
