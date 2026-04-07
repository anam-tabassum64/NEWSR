function extractHeadlines(text, maxHeadlines = 6) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headlines = [];

  for (const line of lines) {
    if (line.length < 30 || line.length > 140) {
      continue;
    }

    const firstChar = line[0];
    if (firstChar !== firstChar.toUpperCase()) {
      continue;
    }

    headlines.push(line);
    if (headlines.length >= maxHeadlines) {
      break;
    }
  }

  return headlines;
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function buildSummary(text, maxSentences = 3) {
  const sentences = splitSentences(text);

  if (!sentences.length) {
    return "";
  }

  const ranked = sentences
    .map((sentence) => ({
      sentence,
      score:
        sentence.length +
        (/[A-Z][a-z]+/.test(sentence) ? 10 : 0) +
        ((sentence.match(/, /g) || []).length * 2),
    }))
    .filter((item) => item.sentence.length >= 40)
    .sort((first, second) => second.score - first.score)
    .slice(0, maxSentences)
    .map((item) => item.sentence);

  return (ranked.length ? ranked : sentences.slice(0, maxSentences)).join(" ");
}

function detectTopics(text) {
  const lowered = text.toLowerCase();
  const topicKeywords = {
    Politics: ["government", "minister", "president", "election", "parliament", "policy"],
    World: ["iran", "israel", "china", "russia", "global", "international"],
    Technology: ["ai", "technology", "software", "platform", "startup", "digital"],
    Business: ["market", "economy", "trade", "company", "business", "finance"],
    Science: ["research", "study", "scientists", "space", "climate", "lab"],
    Health: ["health", "hospital", "clinic", "patient", "medical", "wellness"],
    Sports: ["match", "team", "player", "tournament", "league", "cricket"],
  };

  return Object.entries(topicKeywords)
    .map(([topic, keywords]) => ({
      topic,
      score: keywords.reduce((total, keyword) => total + (lowered.includes(keyword) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 5)
    .map((item) => item.topic);
}

export function summarizeTextLocally(text) {
  const cleanedText = (text || "").trim();

  return {
    page_count: 0,
    word_count: cleanedText ? cleanedText.split(/\s+/).length : 0,
    headlines: extractHeadlines(cleanedText),
    summary: buildSummary(cleanedText),
    topics: detectTopics(cleanedText),
  };
}
