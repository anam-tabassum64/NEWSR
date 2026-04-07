import ArticleCard from "./ArticleCard";

function SkeletonCard() {
  return (
    <div className="card article-card article-card--skeleton">
      <div className="skeleton skeleton-img" />
      <div className="article-card__body">
        <div className="skeleton skeleton-text skeleton-text--sm" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text skeleton-text--lg" />
        <div className="skeleton skeleton-text skeleton-text--md" />
      </div>
    </div>
  );
}

function NewsList({
  articles,
  loading,
  onArticleClick,
  searchQuery,
  onBookmark,
  isBookmarked,
  onLoadMore,
  hasMore,
}) {
  if (!loading && !articles.length) {
    return <p className="empty-state">No articles found. Try a different topic.</p>;
  }

  return (
    <section className="news-list">
      <div className="news-grid">
        {loading && !articles.length
          ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
          : articles.map((article) => (
              <ArticleCard
                key={article.url}
                article={article}
                onArticleClick={onArticleClick}
                searchQuery={searchQuery}
                onBookmark={onBookmark}
                isBookmarked={isBookmarked}
              />
            ))}
      </div>

      {hasMore && articles.length ? (
        <button type="button" className="load-more-button" onClick={onLoadMore}>
          Load more
        </button>
      ) : null}
    </section>
  );
}

export default NewsList;
