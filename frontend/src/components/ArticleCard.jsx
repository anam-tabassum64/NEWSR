import { formatDate } from "../utils/formatDate";
import { highlightText } from "../utils/highlightText";

function ArticleCard({
  article,
  onBookmark,
  isBookmarked,
  onArticleClick,
  searchQuery,
}) {
  const bookmarked = isBookmarked(article.url);
  const titleHtml = highlightText(article.title, searchQuery);

  return (
    <article
      className="card article-card"
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
      <div className="article-card__media">
        {article.image ? (
          <img src={article.image} alt={article.title} className="article-card__image" />
        ) : (
          <div className="article-card__placeholder" aria-hidden="true">
            NEWS
          </div>
        )}
      </div>

      <div className="article-card__body">
        <div className="article-card__meta">
          <span className="article-card__source">{article.source}</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <h3
          className="article-card__title"
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />
        <p className="article-card__description">{article.description}</p>

        <div className="article-card__footer">
          <span className="article-card__readmore">Open story</span>
          <button
            type="button"
            className="bookmark-toggle"
            aria-label={bookmarked ? "Remove bookmark" : "Save article"}
            onClick={(event) => {
              event.stopPropagation();
              onBookmark(article);
            }}
          >
            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;
