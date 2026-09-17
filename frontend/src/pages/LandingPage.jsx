import { useEffect, useRef, useState } from "react";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.18 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function LandingPage({ onExplore, onFeatureOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef(null);
  useReveal();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const handleHeroMove = (event) => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 2}`);
    hero.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height - .5) * 2}`);
  };

  return <main className="landing-page">
    <nav className={`landing-nav ${menuOpen ? "landing-nav--open" : ""}`} aria-label="Public navigation">
      <button className="landing-logo" onClick={() => scrollTo("top")}>NEWSPULSE<span /></button>
      <button className="landing-menu" aria-label="Toggle menu" onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? "×" : "☰"}</button>
      <div className="landing-nav__links"><button onClick={() => scrollTo("top")}>Home</button><button onClick={() => scrollTo("features")}>Features</button><button onClick={() => scrollTo("how-it-works")}>How it works</button><button onClick={() => scrollTo("about")}>About</button></div>
      <div className="landing-nav__actions"><button onClick={onExplore}>Log in</button><button className="landing-cta" onClick={onExplore}>Explore News <b>↗</b></button></div>
    </nav>

    <section className="landing-hero" id="top" ref={heroRef} onMouseMove={handleHeroMove}>
      <p className="landing-eyebrow">INTELLIGENT NEWS, MADE PERSONAL <i /></p>
      <h1><span>YOUR WORLD.</span><span>IN THE KNOW.</span></h1>
      <p className="landing-hero__copy">News that adapts to what matters to you.</p>
      <div className="landing-hero__actions"><button className="landing-cta" onClick={onExplore}>Explore News <b>↗</b></button><button className="landing-text-link" onClick={() => scrollTo("how-it-works")}>See how it works <b>↓</b></button></div>
      <div className="hero-objects" aria-label="A preview of your personalized news feed">
        <article className="hero-story hero-story--one"><header><small>Technology</small><b>01</b></header><strong>AI is changing the shape of everyday work.</strong><footer><span>Reuters</span><em>4 min read</em></footer></article>
        <article className="hero-story hero-story--two"><header><small>Business</small><b>02</b></header><strong>Markets are watching a new set of signals.</strong><footer><span>Live brief</span><em>2 min read</em></footer></article>
        <article className="hero-story hero-story--three"><header><small>Science</small><b>03</b></header><strong>A new idea worth knowing.</strong><footer><span>Editor's pick</span></footer></article>
        <span className="hero-orbit hero-orbit--one" /><span className="hero-orbit hero-orbit--two" />
      </div>
      <button className="scroll-cue" onClick={() => scrollTo("problem")}>SCROLL TO DISCOVER <span>↓</span></button>
    </section>

    <section className="landing-problem reveal" id="problem">
      <p><span>THE WORLD</span><span>MOVES FAST.</span></p>
      <p className="landing-problem__muted"><span>YOUR FEED</span><span>SHOULD TOO.</span></p>
      <strong><span>STAY AHEAD.</span><span>STAY INFORMED.</span></strong>
      <small>Less searching. More signal.</small>
    </section>

    <section className="landing-sources reveal" id="how-it-works">
      <div><p className="landing-eyebrow">MULTI-SOURCE INTELLIGENCE <i /></p><h2>EVERY STORY.<br />ONE PLACE.</h2><p>NewsPulse brings together coverage from NewsData, Currents, and Google News RSS, then helps you find the signal in the stream.</p></div>
      <div className="source-network" aria-label="News sources connected to NewsPulse">
        <p className="source-network__label">Live sources <span /></p>
        <div className="source-network__sources">
          <article><span className="source-network__icon source-network__icon--blue">N</span><div><strong>NewsData</strong><small>Global coverage</small></div><i>↗</i></article>
          <article><span className="source-network__icon source-network__icon--orange">C</span><div><strong>Currents</strong><small>Breaking stories</small></div><i>↗</i></article>
          <article><span className="source-network__icon source-network__icon--red">G</span><div><strong>Google News</strong><small>Publisher signals</small></div><i>↗</i></article>
        </div>
        <div className="source-network__hub"><span>✦</span><strong>NEWS<br />PULSE</strong><small>One intelligent feed</small></div>
        <p className="source-network__status"><span /> Stories, connected</p>
      </div>
    </section>

    <section className="landing-personal reveal"><div><p className="landing-eyebrow">AN EXAMPLE INTEREST PROFILE <i /></p><h2>NEWS THAT<br />KNOWS WHAT<br />MATTERS.</h2></div><div className="interest-visual" aria-label="A personalized NewsPulse feed"><div className="interest-visual__halo" /><p className="interest-visual__label"><span /> MADE AROUND YOU</p><article className="interest-story interest-story--primary"><small>TECHNOLOGY · 4 MIN READ</small><strong>What the next wave of AI means for everyday work.</strong><div><span>AI / ML</span><span>Technology</span><i>↗</i></div></article><article className="interest-story interest-story--secondary"><small>SCIENCE</small><strong>The quiet breakthrough reshaping energy.</strong><span>Science</span></article><article className="interest-story interest-story--tertiary"><small>BUSINESS</small><strong>Markets are looking beyond the noise.</strong></article><div className="interest-visual__signal"><i /><i /><i /><span>YOUR SIGNAL</span></div></div></section>

    <section className="landing-recommend reveal" aria-labelledby="recommendation-title">
      <div className="recommend-pipeline" aria-label="How NewsPulse builds a recommendation">
        <span className="recommend-pipeline__label">How it works</span>
        <ol className="recommend-pipeline__steps">
          {[
            ["01", "Article", "A story enters your feed"],
            ["02", "Text analysis", "Topics and context are identified"],
            ["03", "TF-IDF + similarity", "Relevant signals are compared"],
            ["04", "Your interests", "Your reading patterns add context"],
          ].map(([number, title, description], index) => (
            <li key={title}>
              <span className="recommend-pipeline__step"><b>{number}</b><strong>{title}</strong><small>{description}</small></span>
              {index < 3 ? <i aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
        <strong className="recommend-pipeline__result"><span>✦</span> Made for you</strong>
        <span className="recommend-pipeline__watermark" aria-hidden="true">NEWSR</span>
      </div>
      <div><p className="landing-eyebrow">RECOMMENDATION ENGINE <i /></p><h2 id="recommendation-title">NOT JUST<br />MORE NEWS.<br /><mark>THE RIGHT NEWS.</mark></h2><p>Recommendations based on what you read, save, search, and explore.</p></div>
    </section>

    <section className="landing-trending reveal"><p className="landing-eyebrow">LIVE SIGNALS <i /></p><h2>WHAT'S<br />HAPPENING<br />NOW.</h2><ol>{["AI is changing how teams work", "Global markets are watching inflation", "The next frontier in clean energy"].map((story,index) => <li key={story}><b>0{index + 1}</b><span>{story}<small>Multiple sources · Today</small></span><em>↗</em></li>)}</ol></section>

    <section className="landing-newspapers reveal"><div><p className="landing-eyebrow">E-NEWSPAPERS <i /></p><h2>THE FRONT<br />PAGE, TOO.</h2><p>Move from the live feed to the editions you trust. Browse national and regional newspapers across languages, all from one calm reading space.</p><button className="landing-cta" onClick={onExplore}>Browse newspapers <b>↗</b></button></div><div className="newspaper-stack" aria-label="Illustrative newspaper preview"><article className="newspaper-paper newspaper-paper--back"><small>THE DAILY EDITION</small><b>WORLD<br />AT A GLANCE</b><i /></article><article className="newspaper-paper newspaper-paper--front"><header><small>NEWS</small><strong>PULSE</strong><small>SEPTEMBER</small></header><h3>THE STORIES<br />BEHIND<br />TODAY.</h3><p>National · Regional · Your language</p><span>READ THE EDITION ↗</span></article><em>15 languages<br />28 states</em></div></section>

    <section className="landing-summary reveal"><div><p className="landing-eyebrow">AI SUMMARIZATION <i /></p><h2>UNDERSTAND<br />MORE.<br />READ LESS.</h2><p>Paste text. Upload a PDF. Get a concise summary.</p><button className="landing-cta" onClick={onExplore}>Try the summarizer <b>↗</b></button></div><div className="summary-demo"><small>LONG ARTICLE</small><p>Stories move quickly. Important details can hide beneath the noise, context and constant updates.</p><span /><strong>SUMMARY</strong><ol><li>Key context, distilled</li><li>What matters now</li><li>What to watch next</li></ol><em>7 MIN READ <b>→</b> 2 MIN SUMMARY</em></div></section>

    <section className="landing-features reveal" id="features"><p className="landing-eyebrow">THE NEWSPULSE TOOLKIT <i /></p><h2>A SMARTER WAY<br />TO STAY INFORMED.</h2><div>{[["Personalized feed","A news view shaped by your signals.","/app#feed"],["Trending","See what is gaining momentum.","/app#trending"],["Bookmarks","Keep stories for the right moment.","/app#bookmarks"],["Reading history","Return to your reading journey.","/app#history"],["AI summarizer","Understand the essential points faster.","/app#summarizer"],["Analytics","See how your interests evolve.","/profile#analytics"]].map(([title,copy,destination],index) => <button type="button" className="landing-feature-card" key={title} onClick={() => onFeatureOpen?.(destination)}><b>0{index + 1}</b><h3>{title}</h3><p>{copy}</p><span aria-hidden="true">↗</span><small className="sr-only">Open {title}</small></button>)}</div></section>

    <section className="landing-final reveal" id="about"><p>THE NEWS<br />IS ALWAYS MOVING.</p><h2>SO SHOULD<br />YOUR FEED.</h2><button className="landing-cta" onClick={onExplore}>Explore News <b>↗</b></button></section>
    <footer className="landing-footer">
      <section className="landing-footer__intro"><strong>NEWSPULSE<span /></strong><h2>Your world.<br />In the know.</h2><p>A calmer, more personal way to follow the stories shaping your day.</p></section>
      <section className="landing-footer__links" aria-label="Product links"><p>Product</p><button onClick={() => scrollTo("top")}>Home</button><button onClick={onExplore}>Explore news</button><button onClick={() => scrollTo("features")}>Features</button><button onClick={() => scrollTo("how-it-works")}>How it works</button></section>
      <section className="landing-footer__links" aria-label="Company links"><p>Company</p><button onClick={() => scrollTo("about")}>About NewsPulse</button><button onClick={onExplore}>Sign in</button><button onClick={() => scrollTo("top")}>Privacy</button><button onClick={() => scrollTo("top")}>Terms</button></section>
      <section className="landing-footer__connect"><p>Find us online</p><div><a href="#social-linkedin" aria-label="LinkedIn profile">in</a><a href="#social-x" aria-label="X profile">𝕏</a><a href="#social-instagram" aria-label="Instagram profile">ig</a></div><small>Follow the signal.<br />Stay in the know.</small></section>
      <div className="landing-footer__bottom"><small>© {new Date().getFullYear()} NewsPulse. All rights reserved.</small><p>Designed &amp; built by <b>Anam Tabassum</b><span>·</span><em>@anamtabassum.at@gmail.com</em></p></div>
    </footer>
  </main>;
}

export default LandingPage;
