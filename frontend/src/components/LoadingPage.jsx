import { useEffect, useState } from "react";

function LoadingPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className={`intro-screen ${visible ? "intro-screen--ready" : ""}`} aria-label="Loading NewsPulse">
      <div className="intro-screen__mark" aria-hidden="true" />
      <p className="intro-screen__name">NEWSPULSE</p>
      <p className="intro-screen__tagline">NEWS <span>·</span> DISCOVER <span>·</span> UNDERSTAND</p>
    </main>
  );
}

export default LoadingPage;
