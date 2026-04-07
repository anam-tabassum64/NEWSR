const TOPIC_ARTICLES = {
  all: [
    {
      title: "Morning Briefing: Global stories shaping the day",
      description: "A broad look at politics, markets, science, and technology stories readers are following.",
      source: "NEWSR Desk",
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/all/morning-briefing",
    },
    {
      title: "Readers want faster summaries and cleaner news feeds",
      description: "Publishers are leaning into digestible cards, topic filters, and personalized reading experiences.",
      source: "Digital Daily",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/all/reader-experience",
    },
    {
      title: "What is trending across business, health, and science",
      description: "Cross-beat reporting is helping readers understand how major stories intersect.",
      source: "Signal Watch",
      image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/all/cross-beat",
    },
  ],
  ai: [
    {
      title: "AI assistants move deeper into daily work",
      description: "Teams are using AI tools for research, writing, meeting notes, and coding support.",
      source: "AI Brief",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/ai/daily-work",
    },
    {
      title: "Lean AI models gain ground on cost and speed",
      description: "Smaller models are becoming practical choices for product teams shipping useful features quickly.",
      source: "Compute Journal",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/ai/lean-models",
    },
    {
      title: "Industry-specific AI products keep expanding",
      description: "Startups are focusing on narrow, high-value workflows instead of broad all-purpose tools.",
      source: "Venture Grid",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/ai/industry-products",
    },
  ],
  technology: [
    {
      title: "Cloud teams push for faster and safer releases",
      description: "Platform teams are reducing manual bottlenecks across build, test, and deployment workflows.",
      source: "Platform Report",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/technology/cloud-releases",
    },
    {
      title: "Consumer devices focus on practical upgrades",
      description: "Battery, camera, and reliability improvements are winning over headline-grabbing gimmicks.",
      source: "Tech Today",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/technology/practical-upgrades",
    },
    {
      title: "Security teams warn about smarter social engineering",
      description: "Organizations are spending more time on awareness as scams become more targeted and convincing.",
      source: "Security Ledger",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/technology/social-engineering",
    },
  ],
  business: [
    {
      title: "Businesses rethink pricing as costs keep shifting",
      description: "Companies are adjusting subscriptions and bundles to protect margins without losing customers.",
      source: "Market Brief",
      image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/business/pricing",
    },
    {
      title: "Remote work continues to reshape hiring patterns",
      description: "Companies are widening talent pools and redesigning team structures beyond major office hubs.",
      source: "Workplace Journal",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/business/hiring",
    },
    {
      title: "Automation remains a priority for lean teams",
      description: "Startups are simplifying support, reporting, and operations with lightweight automation.",
      source: "Startup Ledger",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/business/automation",
    },
  ],
  sports: [
    {
      title: "Title races tighten as teams enter key stretch",
      description: "Recent results have narrowed margins and raised the stakes across major competitions.",
      source: "Sports Central",
      image: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/sports/title-race",
    },
    {
      title: "Coaches lean on recovery as schedules intensify",
      description: "Sports science and squad rotation are becoming central to performance planning.",
      source: "Performance Weekly",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/sports/recovery",
    },
    {
      title: "Video analysis becomes a bigger competitive edge",
      description: "Teams are using richer match data to refine tactics and player development.",
      source: "Training Ground",
      image: "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/sports/video-analysis",
    },
  ],
  science: [
    {
      title: "Researchers improve climate forecasting models",
      description: "New modeling techniques aim to sharpen regional predictions and planning decisions.",
      source: "Science Desk",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/science/climate-models",
    },
    {
      title: "Ocean surveys reveal ecosystem shifts",
      description: "Marine researchers are tracking how temperature changes affect species distribution.",
      source: "Nature Monitor",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/science/ocean-surveys",
    },
    {
      title: "Astronomy teams prepare for larger data streams",
      description: "Observatories and labs are upgrading analysis pipelines for next-generation telescopes.",
      source: "Cosmos Review",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/science/astronomy-data",
    },
  ],
  health: [
    {
      title: "Preventive care programs expand across clinics",
      description: "Health systems are trying earlier outreach to reduce avoidable emergency visits.",
      source: "Health Journal",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/health/preventive-care",
    },
    {
      title: "Wearable devices influence daily wellness habits",
      description: "Users are turning routine health metrics into more practical everyday decisions.",
      source: "Wellness Wire",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/health/wearables",
    },
    {
      title: "Public health teams test clearer messaging",
      description: "Simple language and better communication design are being used to improve trust.",
      source: "Care Report",
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
      url: "https://example.com/demo/health/messaging",
    },
  ],
};

function buildPublishedAt(offsetHours) {
  return new Date(Date.now() - offsetHours * 60 * 60 * 1000).toISOString();
}

export function getFallbackNews(topic, page = 1, sortBy = "latest") {
  const baseArticles = TOPIC_ARTICLES[topic] || TOPIC_ARTICLES.all;
  const expanded = [];

  for (let batch = 1; batch <= 4; batch += 1) {
    baseArticles.forEach((article, index) => {
      expanded.push({
        id: (page - 1) * 12 + expanded.length + 1,
        title: `${article.title}${batch > 1 ? ` #${batch}` : ""}`,
        description: article.description,
        source: article.source,
        image: article.image,
        url: `${article.url}?batch=${batch}`,
        publishedAt: buildPublishedAt((batch - 1) * 6 + index + 1),
      });
    });
  }

  if (sortBy === "latest") {
    expanded.sort((first, second) => new Date(second.publishedAt) - new Date(first.publishedAt));
  }

  const pageSize = 12;
  const start = (page - 1) * pageSize;
  return expanded.slice(start, start + pageSize);
}
