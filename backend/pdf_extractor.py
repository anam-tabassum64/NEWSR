import re

import fitz


def extract_text_from_pdf(file_bytes):
    """
    Extract text from a PDF using PyMuPDF and return a small metadata summary.
    """
    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as error:
        return {"error": f"Failed to open PDF: {error}"}

    page_texts = []

    try:
        for page in document:
            page_texts.append(page.get_text() or "")
    except Exception as error:
        document.close()
        return {"error": f"Failed to extract PDF text: {error}"}

    document.close()

    full_text = "\n".join(page_texts).strip()
    word_count = len(full_text.split()) if full_text else 0

    return {
        "text": full_text,
        "page_count": len(page_texts),
        "word_count": word_count,
    }


def _word_overlap_ratio(first_text, second_text):
    first_words = set(re.findall(r"[A-Za-z]+", first_text.lower()))
    second_words = set(re.findall(r"[A-Za-z]+", second_text.lower()))

    if not first_words or not second_words:
        return 0

    overlap = len(first_words & second_words)
    smaller_set = min(len(first_words), len(second_words))
    return overlap / smaller_set if smaller_set else 0


def extract_headlines_from_text(text, max_headlines=8):
    """
    Find headline-like lines from PDF text using simple heuristics.
    """
    if not text.strip():
        return []

    page_chunks = [text[index : index + 600] for index in range(0, len(text), 600)]
    collected = []

    for chunk in page_chunks:
        lines = [line.strip() for line in chunk.splitlines() if line.strip()]

        for line in lines:
            if len(line) < 20 or len(line) > 120:
                continue

            if re.fullmatch(r"[\d\s.,:/-]+", line):
                continue

            if not line[0].isupper():
                continue

            is_similar = any(_word_overlap_ratio(line, existing) >= 0.7 for existing in collected)
            if is_similar:
                continue

            collected.append(line)
            break

        if len(collected) >= max_headlines:
            break

    return collected[:max_headlines]


def generate_summary_from_text(text, max_words=120):
    """
    Create a short extractive summary from the first section of the PDF text.
    """
    trimmed_text = (text or "").strip()[:3000]
    if not trimmed_text:
        return ""

    sentences = [sentence.strip() for sentence in trimmed_text.split(". ") if sentence.strip()]
    scored_sentences = []

    for sentence in sentences:
        sentence_length = len(sentence)

        if sentence_length < 40 or sentence_length > 200:
            continue

        capital_words = re.findall(r"\b[A-Z][A-Z]+\b", sentence)
        score = sentence_length / 10 + len(capital_words) * 6
        scored_sentences.append((score, sentence))

    if not scored_sentences:
        fallback_words = trimmed_text.split()
        return " ".join(fallback_words[:max_words])

    top_sentences = [sentence for _, sentence in sorted(scored_sentences, reverse=True)[:5]]
    summary = ". ".join(top_sentences)

    if summary and not summary.endswith("."):
        summary += "."

    summary_words = summary.split()
    if len(summary_words) > max_words:
        summary = " ".join(summary_words[:max_words]).rstrip(" .,") + "..."

    return summary


def detect_topics_from_text(text):
    """
    Detect broad news topics from keyword frequency.
    """
    topic_keywords = {
        "Politics": ["parliament", "minister", "election", "government", "party", "vote"],
        "Economy": ["gdp", "rbi", "rupee", "market", "inflation", "budget", "bank"],
        "Science": ["isro", "research", "study", "space", "technology", "discovery"],
        "Sports": ["cricket", "ipl", "football", "tournament", "match", "player"],
        "World": ["un", "china", "us", "russia", "global", "international"],
    }

    lowered = (text or "").lower()
    matches = []

    for topic, keywords in topic_keywords.items():
        hit_count = sum(lowered.count(keyword.lower()) for keyword in keywords)
        if hit_count > 2:
            matches.append((topic, hit_count))

    matches.sort(key=lambda item: item[1], reverse=True)
    return [topic for topic, _ in matches]


def generate_article_tools(title, description, content=""):
    text = " ".join(value.strip() for value in (title, description, content) if value and value.strip())
    sentences = [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text) if sentence.strip()]
    facts = [sentence for sentence in sentences if re.search(r"\d|\b(is|are|will|has|have|announced|reported)\b", sentence, re.I)][:4]
    summary = generate_summary_from_text(text, max_words=90)
    topics = detect_topics_from_text(text)
    simple = re.sub(r"\b(utilize|approximately|demonstrate|commence)\b", lambda match: {
        "utilize": "use", "approximately": "about", "demonstrate": "show", "commence": "start"
    }[match.group(1).lower()], summary, flags=re.I)
    focus = ", ".join(topics[:2]) if topics else "this topic"
    return {
        "summary": summary or description or title,
        "key_facts": facts or [description or title],
        "explain_simply": simple or description or title,
        "why_it_matters": f"This matters because it may affect how people understand or respond to {focus}.",
        "topics": topics,
    }
