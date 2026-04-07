import { useRef, useState } from "react";
import { summarizeContent } from "../services/api";

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const topicPillClasses = ["pill-blue", "pill-green", "pill-amber", "pill-purple", "pill-coral"];

function PDFSummarizer() {
  const [inputMode, setInputMode] = useState("pdf");
  const [file, setFile] = useState(null);
  const [textValue, setTextValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  function resetState(nextMode = inputMode) {
    setInputMode(nextMode);
    setFile(null);
    setTextValue("");
    setDragOver(false);
    setUploadStage("idle");
    setResult(null);
    setErrorMsg("");
  }

  function handleSelectedFile(selectedFile) {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setUploadStage("idle");
    setResult(null);
    setErrorMsg("");
  }

  async function handleSummarize() {
    const trimmedText = textValue.trim();

    if (inputMode === "pdf" && !file) {
      setErrorMsg("Choose a PDF file first.");
      return;
    }

    if (inputMode === "text" && !trimmedText) {
      setErrorMsg("Paste some news text first.");
      return;
    }

    setUploadStage("uploading");
    setErrorMsg("");
    setResult(null);

    try {
      setUploadStage(inputMode === "pdf" ? "extracting" : "summarizing");
      const summaryResult = await summarizeContent({
        file: inputMode === "pdf" ? file : null,
        text: inputMode === "text" ? trimmedText : "",
      });
      setResult(summaryResult);
      setUploadStage("done");
    } catch (error) {
      setErrorMsg(error.message || "Failed to summarize this content.");
      setUploadStage("error");
    }
  }

  return (
    <section className="full-width-card">
      <div className="section-header">
        <div className="section-header__title">
          <span className="section-dot" />
          <h2>Summary Section</h2>
        </div>
      </div>

      <div className="summary-mode-toggle" role="tablist" aria-label="Summary input mode">
        <button
          type="button"
          className={`summary-mode-toggle__button ${inputMode === "pdf" ? "summary-mode-toggle__button--active" : ""}`}
          onClick={() => resetState("pdf")}
        >
          PDF upload
        </button>
        <button
          type="button"
          className={`summary-mode-toggle__button ${inputMode === "text" ? "summary-mode-toggle__button--active" : ""}`}
          onClick={() => resetState("text")}
        >
          Paste text
        </button>
      </div>

      <div className="pdf-layout">
        <div className="pdf-panel">
          {inputMode === "pdf" ? (
            <>
              {uploadStage === "idle" && !file ? (
                <div
                  className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOver(false);
                    handleSelectedFile(event.dataTransfer.files?.[0] || null);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className="upload-zone__icon">PDF</div>
                  <h3>Drop your newspaper PDF here</h3>
                  <p>Supports digital or scanned PDFs. Maximum 50 MB.</p>
                  <button type="button" className="primary-button">
                    Choose file
                  </button>
                </div>
              ) : null}

              {file && uploadStage === "idle" ? (
                <div className="file-ready-card">
                  <h3>{file.name}</h3>
                  <p>{formatFileSize(file.size)}</p>
                  <button type="button" className="primary-button primary-button--full" onClick={handleSummarize}>
                    Summarize PDF
                  </button>
                  <button type="button" className="text-link-button" onClick={() => resetState("pdf")}>
                    Remove
                  </button>
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={(event) => handleSelectedFile(event.target.files?.[0] || null)}
              />
            </>
          ) : (
            <div className="text-summary-panel">
              <label className="text-summary-panel__label" htmlFor="summary-textarea">
                Paste article text, e-paper copy, or notes
              </label>
              <textarea
                id="summary-textarea"
                className="text-summary-panel__textarea"
                placeholder="Paste the news text you want summarized..."
                value={textValue}
                onChange={(event) => {
                  setTextValue(event.target.value);
                  setUploadStage("idle");
                  setResult(null);
                  setErrorMsg("");
                }}
              />
              <div className="text-summary-panel__footer">
                <span>{textValue.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button type="button" className="primary-button" onClick={handleSummarize}>
                  Summarize text
                </button>
              </div>
            </div>
          )}
        </div>

        {uploadStage !== "idle" && uploadStage !== "done" && uploadStage !== "error" ? (
          <div className="pdf-panel">
            <h3 className="pdf-panel__title">Processing progress</h3>
            <div className="step-row">
              <span className="step-circle step-done">1</span>
              <span>{inputMode === "pdf" ? "Input received" : "Text captured"}</span>
            </div>
            <div className="step-row">
              <span className={`step-circle ${uploadStage === "extracting" ? "step-active" : uploadStage === "summarizing" ? "step-done" : "step-pending"}`}>
                2
              </span>
              <span>{inputMode === "pdf" ? "Extracting readable text from PDF" : "Preparing text for analysis"}</span>
            </div>
            <div className="step-row">
              <span className={`step-circle ${uploadStage === "summarizing" ? "step-active" : "step-pending"}`}>
                3
              </span>
              <span>Generating headlines, topics, and summary</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: uploadStage === "extracting" ? "55%" : "85%",
                }}
              />
            </div>
          </div>
        ) : null}

        {uploadStage === "error" ? (
          <div className="pdf-panel pdf-panel--error">
            <p>{errorMsg}</p>
            <button type="button" className="primary-button" onClick={() => resetState(inputMode)}>
              Try again
            </button>
          </div>
        ) : null}

        {uploadStage === "done" && result ? (
          <div className="pdf-results">
            <div className="stats-row">
              <div className="metric-card">
                <span className="metric-card__label">{inputMode === "pdf" ? "Pages" : "Input type"}</span>
                <strong>{inputMode === "pdf" ? result.page_count : "Text"}</strong>
              </div>
              <div className="metric-card">
                <span className="metric-card__label">Words</span>
                <strong>{result.word_count.toLocaleString()}</strong>
              </div>
              <div className="metric-card">
                <span className="metric-card__label">Topics found</span>
                <strong>{result.topics.length}</strong>
              </div>
            </div>

            <div className="pdf-results-grid">
              <article className="pdf-result-card">
                <h3>Key headlines</h3>
                {result.headlines.length ? (
                  <ol className="headline-list">
                    {result.headlines.map((headline, index) => (
                      <li key={`${headline}-${index}`} className="headline-list__item">
                        <span className="headline-list__number">{index + 1}</span>
                        <span>{headline}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="pdf-summary-text">No strong headline candidates were found in this input.</p>
                )}
              </article>

              <article className="pdf-result-card">
                <h3>Short summary</h3>
                <div className="topic-tag-row">
                  {result.topics.map((topic, index) => (
                    <span
                      key={`${topic}-${index}`}
                      className={`topic-tag ${topicPillClasses[index % topicPillClasses.length]}`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <p className="pdf-summary-text">
                  {result.summary || "A short summary could not be generated from the provided content."}
                </p>
              </article>
            </div>

            <button type="button" className="primary-button" onClick={() => resetState(inputMode)}>
              Summarize another input
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default PDFSummarizer;
