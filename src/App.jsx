import { useState, useEffect, useCallback, useRef } from "react";

/* ─── tiny confetti engine (no deps) ─── */
function launchConfetti(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({ length: 260 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 7 + 3,
    dx: (Math.random() - 0.5) * 4,
    dy: Math.random() * 3 + 2,
    rot: Math.random() * 360,
    drot: (Math.random() - 0.5) * 8,
    color: [
      "#ff6b8a",
      "#ff85a1",
      "#ffc2d1",
      "#b5e48c",
      "#76c893",
      "#52b69a",
      "#d4a5ff",
      "#ffd6e0",
      "#a7f3d0",
      "#fff1f2",
      "#f9c6d3",
      "#86efac",
      "#fda4af",
      "#bbf7d0",
      "#e8b4f8",
    ][Math.floor(Math.random() * 15)],
    shape: Math.random() > 0.5 ? "rect" : "circle",
    w: Math.random() * 8 + 4,
    h: Math.random() * 5 + 2,
  }));
  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      if (p.y > canvas.height + 20) return;
      alive = true;
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.04;
      p.rot += p.drot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1, (canvas.height - p.y + 200) / 300);
      if (p.shape === "rect") ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (alive) frame = requestAnimationFrame(draw);
  }
  draw();
  return () => cancelAnimationFrame(frame);
}

/* ─── heart SVG helper ─── */
const Heart = ({
  size = 20,
  color = "#ff6b8a",
  style = {},
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    style={style}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

/* ─── leaf SVG helper ─── */
const Leaf = ({ size = 24, color = "#76c893", style = {}, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
    className={className}
    style={style}
  >
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
  </svg>
);

/* ─── petal / floating element ─── */
const FloatingPetal = ({
  delay,
  left,
  size,
  color,
  duration,
  type = "heart",
}) => (
  <div
    className="floating-element"
    style={{
      animationDelay: `${delay}s`,
      left: `${left}%`,
      animationDuration: `${duration}s`,
    }}
  >
    {type === "heart" ? (
      <Heart size={size} color={color} />
    ) : (
      <Leaf size={size} color={color} />
    )}
  </div>
);

/* ─── photo gallery ─── */
const Gallery = ({ images }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="gallery-container fade-in-up">
      <div className="gallery-header">
        <Leaf
          size={28}
          color="#76c893"
          style={{ transform: "rotate(-30deg)" }}
        />
        <h2 className="gallery-title">Our Beautiful Moments</h2>
        <Leaf
          size={28}
          color="#76c893"
          style={{ transform: "rotate(30deg) scaleX(-1)" }}
        />
      </div>
      <p className="gallery-subtitle">
        Every moment with you is a treasure I hold close to my heart
      </p>

      <div className="gallery-grid">
        {images.map((src, i) => (
          <div
            key={i}
            className="gallery-item"
            style={{ animationDelay: `${i * 0.08}s` }}
            onClick={() => setSelected(i)}
          >
            <img src={src} alt={`Our memory ${i + 1}`} loading="lazy" />
            <div className="gallery-item-overlay">
              <Heart size={24} color="#fff" />
            </div>
          </div>
        ))}
      </div>

      {selected !== null && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            <img src={images[selected]} alt={`Memory ${selected + 1}`} />
            <div className="lightbox-nav">
              <button
                onClick={() =>
                  setSelected((selected - 1 + images.length) % images.length)
                }
                className="lightbox-arrow"
              >
                ‹
              </button>
              <span className="lightbox-counter">
                {selected + 1} / {images.length}
              </span>
              <button
                onClick={() => setSelected((selected + 1) % images.length)}
                className="lightbox-arrow"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN APP ─── */
export default function App() {
  const [answered, setAnswered] = useState(false);
  const [noPos, setNoPos] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const canvasRef = useRef(null);
  const cardRef = useRef(null);

  // images from /public/photos/
  const images = Array.from(
    { length: 12 },
    (_, i) => `/photos/photo${i + 1}.jpeg`,
  );

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 300);
    const t2 = setTimeout(() => setCardVisible(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const moveNoButton = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = 140;
    const btnH = 52;
    setNoPos({
      x: Math.random() * (vw - btnW - 40) + 20,
      y: Math.random() * (vh - btnH - 40) + 20,
    });
  }, []);

  const handleYes = () => {
    setAnswered(true);
    if (canvasRef.current) launchConfetti(canvasRef.current);
    // second burst
    setTimeout(() => {
      if (canvasRef.current) launchConfetti(canvasRef.current);
    }, 1200);
  };

  /* floating elements data */
  const floatingElements = [
    {
      delay: 0,
      left: 5,
      size: 18,
      color: "#ff85a1",
      duration: 14,
      type: "heart",
    },
    {
      delay: 2,
      left: 15,
      size: 14,
      color: "#ffc2d1",
      duration: 12,
      type: "heart",
    },
    {
      delay: 4,
      left: 25,
      size: 22,
      color: "#76c893",
      duration: 16,
      type: "leaf",
    },
    {
      delay: 1,
      left: 35,
      size: 16,
      color: "#ff6b8a",
      duration: 13,
      type: "heart",
    },
    {
      delay: 3,
      left: 45,
      size: 20,
      color: "#b5e48c",
      duration: 15,
      type: "leaf",
    },
    {
      delay: 5,
      left: 55,
      size: 15,
      color: "#fda4af",
      duration: 11,
      type: "heart",
    },
    {
      delay: 2,
      left: 65,
      size: 24,
      color: "#52b69a",
      duration: 17,
      type: "leaf",
    },
    {
      delay: 0.5,
      left: 75,
      size: 17,
      color: "#ff85a1",
      duration: 14,
      type: "heart",
    },
    {
      delay: 3.5,
      left: 85,
      size: 20,
      color: "#86efac",
      duration: 13,
      type: "leaf",
    },
    {
      delay: 1.5,
      left: 92,
      size: 13,
      color: "#ffc2d1",
      duration: 12,
      type: "heart",
    },
    {
      delay: 4.5,
      left: 10,
      size: 19,
      color: "#76c893",
      duration: 16,
      type: "leaf",
    },
    {
      delay: 6,
      left: 50,
      size: 16,
      color: "#ff6b8a",
      duration: 10,
      type: "heart",
    },
    {
      delay: 7,
      left: 30,
      size: 21,
      color: "#b5e48c",
      duration: 18,
      type: "leaf",
    },
    {
      delay: 0.8,
      left: 70,
      size: 12,
      color: "#fda4af",
      duration: 11,
      type: "heart",
    },
    {
      delay: 5.5,
      left: 40,
      size: 18,
      color: "#52b69a",
      duration: 14,
      type: "leaf",
    },
  ];

  return (
    <div className="app">
      {/* ── background layers ── */}
      <div className="bg-layer bg-gradient" />
      <div className="bg-layer bg-pattern" />
      <div className="bg-layer bg-vignette" />

      {/* ── floating hearts & leaves ── */}
      <div className="floating-container">
        {floatingElements.map((el, i) => (
          <FloatingPetal key={i} {...el} />
        ))}
      </div>

      {/* ── fireflies ── */}
      <div className="fireflies">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="firefly"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* ── confetti canvas ── */}
      <canvas ref={canvasRef} className="confetti-canvas" />

      {/* ── main content ── */}
      {!answered ? (
        <div className={`question-scene ${showContent ? "visible" : ""}`}>
          {/* decorative top flourish */}
          <div className="flourish-top">
            <Leaf
              size={32}
              color="#76c893"
              style={{ transform: "rotate(-45deg)", opacity: 0.7 }}
            />
            <Heart size={20} color="#ff85a1" style={{ margin: "0 8px" }} />
            <Leaf
              size={32}
              color="#76c893"
              style={{ transform: "rotate(45deg) scaleX(-1)", opacity: 0.7 }}
            />
          </div>

          {/* the card */}
          <div
            ref={cardRef}
            className={`valentine-card ${cardVisible ? "card-enter" : ""}`}
          >
            <div className="card-glow" />
            <div className="card-border-decoration">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="border-flower"
                  style={{
                    top:
                      i < 3 ? "0" : i < 6 ? "100%" : `${((i % 3) + 1) * 25}%`,
                    left:
                      i < 3
                        ? `${(i + 1) * 25}%`
                        : i < 6
                          ? `${(i - 2) * 25}%`
                          : i < 9
                            ? "0"
                            : "100%",
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  <Heart
                    size={10}
                    color={i % 2 === 0 ? "#ff85a1" : "#b5e48c"}
                  />
                </div>
              ))}
            </div>

            <div className="card-inner">
              <div className="card-ribbon">
                <Heart size={14} color="#fff" />
              </div>

              <h1 className="card-title">
                <span className="title-line-1">Will You Be My</span>
                <span className="title-line-2">Valentine</span>
                <span className="title-line-3">Vianney?</span>
              </h1>

              <div className="card-divider">
                <span className="divider-line" />
                <Heart size={16} color="#ff6b8a" />
                <span className="divider-line" />
              </div>

              <p className="card-message">
                Every moment with you feels like a garden in bloom.
                <br />
                You are my sunshine and my favorite adventure.
              </p>

              <div className="buttons-row">
                <button className="btn btn-yes" onClick={handleYes}>
                  <Heart size={16} color="#fff" style={{ marginRight: 6 }} />
                  Yes!
                  <Heart size={16} color="#fff" style={{ marginLeft: 6 }} />
                </button>

                <button
                  className="btn btn-no"
                  onMouseEnter={moveNoButton}
                  onTouchStart={moveNoButton}
                  style={
                    noPos
                      ? {
                          position: "fixed",
                          left: noPos.x,
                          top: noPos.y,
                          zIndex: 9999,
                          transition: "none",
                        }
                      : {}
                  }
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* decorative bottom */}
          <p className="bottom-whisper">
            (hint: there's only one right answer 💚)
          </p>
        </div>
      ) : (
        /* ── AFTER YES ── */
        <div className="celebration-scene fade-in-up">
          <div className="celebration-header">
            <Heart size={36} color="#ff6b8a" className="pulse-heart" />
            <h1 className="celebration-title">She Said Yes!</h1>
            <Heart size={36} color="#ff6b8a" className="pulse-heart" />
          </div>
          <p className="celebration-subtitle">
            You just made me the happiest person alive, Vianney.
            <br />
            Here are some of my favorite memories of us...
          </p>
          <Gallery images={images} />
          <div className="celebration-footer">
            <Leaf
              size={20}
              color="#76c893"
              style={{ transform: "rotate(-20deg)" }}
            />
            <span>Forever & Always</span>
            <Heart size={16} color="#ff6b8a" />
            <Leaf
              size={20}
              color="#76c893"
              style={{ transform: "rotate(20deg) scaleX(-1)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
