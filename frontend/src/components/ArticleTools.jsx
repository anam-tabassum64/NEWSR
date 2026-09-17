import { useEffect, useState } from "react";
import { fetchArticleTools } from "../services/api";

function ArticleTools({ article, onClose }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchArticleTools(article)
      .then((data) => active && setResult(data))
      .catch((requestError) => active && setError(requestError.message));
    return () => {
      active = false;
    };
  }, [article]);

  return (
    <section className="article-tools-panel card" aria-live="polite">
      <div className="section-header">
        <div>
          <span className="article-tools-panel__eyebrow">Local article intelligence</span>
          <h2>{article.title}</h2>
        </div>
        <button type="button" className="text-link-button" onClick={onClose}>Close</button>
      </div>
      {error ? <p className="error-banner">{error}</p> : null}
      {!result && !error ? <p className="article-tools-panel__loading">Analyzing article...</p> : null}
      {result ? (
        <div className="article-tools-panel__grid">
          <article><h3>Summarize</h3><p>{result.summary}</p></article>
          <article><h3>Key facts</h3><ul>{result.key_facts.map((fact, index) => <li key={`${fact}-${index}`}>{fact}</li>)}</ul></article>
          <article><h3>Explain simply</h3><p>{result.explain_simply}</p></article>
          <article><h3>Why it matters</h3><p>{result.why_it_matters}</p></article>
        </div>
      ) : null}
    </section>
  );
}

export default ArticleTools;