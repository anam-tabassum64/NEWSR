import { useEffect, useMemo, useState } from "react";

const GREETINGS = [
  { text: "Namaste", lang: "Hindi" },
  { text: "Sat Sri Akaal", lang: "Punjabi" },
  { text: "Nomoskar", lang: "Bengali" },
  { text: "Vanakkam", lang: "Tamil" },
  { text: "Namaste", lang: "Telugu" },
  { text: "Namaskara", lang: "Kannada" },
  { text: "Namaskaram", lang: "Malayalam" },
  { text: "Namaskar", lang: "Marathi" },
  { text: "Namaste", lang: "Gujarati" },
  { text: "Adaab", lang: "Urdu" },
];

const DOT_COLORS = [
  "#c4b5fd",
  "#93c5fd",
  "#6ee7b7",
  "#fca5a5",
  "#fcd34d",
  "#f9a8d4",
  "#a5f3fc",
  "#86efac",
  "#fbbf24",
  "#d8b4fe",
];

function Particle({ color, size, left, duration, delay }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left,
        width: size,
        height: size,
        borderRadius: "999px",
        background: color,
        pointerEvents: "none",
        animation: `floatUp ${duration}s ease-in infinite`,
        animationDelay: delay,
        opacity: 0,
      }}
    />
  );
}

function LoadingPage() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPrev(current);
      window.setTimeout(() => {
        setCurrent((value) => (value + 1) % GREETINGS.length);
        setPrev(null);
      }, 500);
    }, 1100);

    return () => window.clearInterval(intervalId);
  }, [current]);

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        color: DOT_COLORS[index % DOT_COLORS.length],
        size: `${Math.random() * 6 + 3}px`,
        left: `${Math.random() * 100}%`,
        duration: (3 + Math.random() * 4).toFixed(2),
        delay: `${(Math.random() * 6).toFixed(2)}s`,
      })),
    []
  );

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-520px) scale(1.4); opacity: 0; }
        }
        @keyframes greetIn {
          0% { opacity: 0; transform: translateY(30px) scale(0.88); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes greetOut {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-28px) scale(0.9); }
        }
        @keyframes barShimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes barGrow {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.6); opacity: 1; }
        }
        @keyframes ringExpand {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .loading-greet-in {
          animation: greetIn 0.7s cubic-bezier(.22,1,.36,1) forwards;
        }
        .loading-greet-out {
          animation: greetOut 0.5s cubic-bezier(.55,0,1,.45) forwards;
        }
      `}</style>

      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          padding: "2rem",
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {particles.map((particle, index) => (
            <Particle key={index} {...particle} />
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            zIndex: 0,
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                top: 0,
                left: 0,
                borderRadius: "999px",
                border: "1.5px solid rgba(167,139,250,0.15)",
                animation: `ringExpand 3s ease-out infinite`,
                animationDelay: `${index}s`,
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "min(720px, 100%)",
            minHeight: 520,
            borderRadius: 32,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "2rem",
            background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            backdropFilter: "blur(8px)",
            boxShadow: "0 25px 60px rgba(5, 8, 24, 0.32)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <img
            src="/newsr-logo-tight.png?v=2"
            alt="NEWSR logo"
            style={{
              width: 170,
              maxWidth: "100%",
              height: "auto",
              marginBottom: "1.2rem",
              filter: "drop-shadow(0 6px 20px rgba(255,255,255,0.12))",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 140,
              marginBottom: "2rem",
            }}
          >
            {prev !== null ? (
              <div
                className="loading-greet-out"
                style={{
                  position: "absolute",
                  fontSize: 42,
                  fontWeight: 600,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                  textShadow: "0 2px 24px rgba(120,80,255,0.4)",
                }}
              >
                {GREETINGS[prev].text}
              </div>
            ) : null}

            <div
              key={current}
              className="loading-greet-in"
              style={{
                position: "absolute",
                fontSize: 42,
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
                textShadow: "0 2px 24px rgba(120,80,255,0.4)",
              }}
            >
              {GREETINGS[current].text}
            </div>

            <div
              style={{
                position: "absolute",
                top: 88,
                fontSize: 13,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(200,180,255,0.65)",
              }}
            >
              {GREETINGS[current].lang}
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem" }}>
            <div
              style={{
                width: 200,
                height: 4,
                borderRadius: 999,
                overflow: "hidden",
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #a78bfa, #60a5fa, #a78bfa)",
                  backgroundSize: "200% 100%",
                  animation: "barShimmer 2s linear infinite, barGrow 11s linear forwards",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "999px",
                    background: "rgba(167,139,250,0.8)",
                    animation: "pulseDot 1.4s ease-in-out infinite",
                    animationDelay: `${index * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadingPage;
