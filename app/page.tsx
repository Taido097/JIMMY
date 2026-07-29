'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const projects = [
  { number: '01', title: 'VOID FORM', year: '2026', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85' },
  { number: '02', title: 'SILENT STRUCTURE', year: '2026', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85' },
  { number: '03', title: 'NOIR MOTION', year: '2025', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85' },
];

const asciiTexture = `
FASHION_001  //////  FORM_002
................................
:: :: ::: :::: :: ::: :::: :: ::
................................
GARMENT / SILHOUETTE / MOVEMENT
:: :: ::: :::: :: ::: :::: :: ::
................................
JIMMY_2026  //////  ARCHIVE_03
`;

const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*?/';
const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@<>/\\[]{}';

function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<number | null>(null);

  const stop = () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (ref.current) ref.current.textContent = text;
  };

  const scramble = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stop();
    let frame = 0;
    const totalFrames = Math.max(12, text.length * 3);

    intervalRef.current = window.setInterval(() => {
      if (!ref.current) return;
      const progress = frame / totalFrames;
      ref.current.textContent = text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        if (index / text.length < progress) return char;
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }).join('');
      frame += 1;
      if (frame > totalFrames) stop();
    }, 28);
  };

  useEffect(() => stop, []);

  return (
    <span ref={ref} className={className} aria-label={text} onMouseEnter={scramble} onFocus={scramble}>
      {text}
    </span>
  );
}

type WordGlyph = {
  tx: number;
  ty: number;
  letter: number;
  startY: number;
  phase: number;
  glyphSeed: number;
  speed: number;
  brightness: number;
};

type RainGlyph = {
  x: number;
  startY: number;
  glyphSeed: number;
  speed: number;
  alpha: number;
  trail: number;
  drift: number;
};

function AsciiIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (dismissed) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const dismiss = () => {
      if (!ready || leaving) return;
      setLeaving(true);
      window.setTimeout(() => setDismissed(true), 850);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 2) dismiss();
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => event.preventDefault();
    const onTouchEnd = (event: TouchEvent) => {
      const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
      if (touchStartY.current - endY > 24) dismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
        event.preventDefault();
        dismiss();
      } else if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown, { passive: false });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ready, leaving, dismissed]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReady(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let wordGlyphs: WordGlyph[] = [];
    let rainGlyphs: RainGlyph[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let heroSize = 0;
    let glyphSize = 7.6;
    let rowGap = 30;

    const centers = [0.065, 0.245, 0.44, 0.685, 0.925];
    const letters = ['J', 'I', 'M', 'M', 'Y'];
    const startedAt = performance.now();
    const rainLeadIn = 760;
    const letterDuration = 660;
    const animationDuration = rainLeadIn + letterDuration * letters.length;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const smoother = (value: number) => {
      const p = clamp(value);
      return p * p * p * (p * (p * 6 - 15) + 10);
    };
    const fract = (value: number) => value - Math.floor(value);
    const hash = (seed: number) => fract(Math.sin(seed * 12.9898) * 43758.5453);
    const glyphAt = (seed: number) => matrixChars[Math.abs(Math.floor(seed)) % matrixChars.length];
    const scrambleToWord = (target: string, progress: number, frame: number) => target
      .split('')
      .map((char, index) => {
        if (char === ' ') return ' ';
        if (progress >= (index + 1) / target.length) return char;
        return matrixChars[(frame * 5 + index * 11) % matrixChars.length];
      })
      .join('');

    const buildField = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const octx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!octx) return;

      heroSize = Math.min(width < 800 ? width * 0.27 : width * 0.22, 350);
      glyphSize = width < 800 ? 6.4 : 7.6;
      rowGap = width < 800 ? 25 : 30;

      octx.fillStyle = '#fff';
      octx.font = `700 ${heroSize}px Arial`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      letters.forEach((letter, index) => {
        octx.fillText(letter, width * centers[index], height * 0.5);
      });

      const data = octx.getImageData(0, 0, width, height).data;
      const maskGap = width < 800 ? 8 : 9;
      const candidates: WordGlyph[] = [];

      for (let y = 0; y < height; y += maskGap) {
        for (let x = 0; x < width; x += maskGap) {
          if (data[(y * width + x) * 4 + 3] <= 120) continue;

          let letter = 0;
          let closest = Number.POSITIVE_INFINITY;
          centers.forEach((center, index) => {
            const distance = Math.abs(x - width * center);
            if (distance < closest) {
              closest = distance;
              letter = index;
            }
          });

          const seed = x * 0.37 + y * 0.71 + letter * 19;
          candidates.push({
            tx: x,
            ty: y,
            letter,
            startY: hash(seed + 1) * (height + 120) - 60,
            phase: hash(seed + 2) * Math.PI * 2,
            glyphSeed: Math.floor(hash(seed + 3) * 100000),
            speed: 46 + hash(seed + 4) * 66,
            brightness: 0.58 + hash(seed + 5) * 0.42,
          });
        }
      }

      const maxWordGlyphs = width < 800 ? 1400 : 2400;
      const stride = Math.max(1, Math.ceil(candidates.length / maxWordGlyphs));
      wordGlyphs = candidates.filter((_, index) => index % stride === 0).slice(0, maxWordGlyphs);

      const columnGap = width < 800 ? 9 : 10;
      const nextRain: RainGlyph[] = [];
      for (let x = columnGap / 2; x < width; x += columnGap) {
        for (let y = -rowGap; y < height + rowGap; y += rowGap) {
          const seed = x * 1.913 + y * 0.817;
          nextRain.push({
            x: x + (hash(seed + 1) - 0.5) * columnGap * 0.16,
            startY: y + (hash(seed + 2) - 0.5) * rowGap * 0.42,
            glyphSeed: Math.floor(hash(seed + 3) * 100000),
            speed: 36 + hash(seed + 4) * 70,
            alpha: 0.07 + hash(seed + 5) * 0.19,
            trail: hash(seed + 6),
            drift: (hash(seed + 7) - 0.5) * 2,
          });
        }
      }
      rainGlyphs = nextRain;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      buildField();
    };

    const drawRain = (elapsed: number, alphaScale: number) => {
      const time = elapsed / 1000;
      const cycleHeight = height + rowGap * 2;
      const glyphFrame = Math.floor(elapsed / 92);
      ctx.font = `${glyphSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      rainGlyphs.forEach((glyph, index) => {
        const x = glyph.x
          + Math.sin(time * 1.05 + glyph.startY * 0.018 + glyph.speed * 0.022) * 2.3
          + glyph.drift * Math.sin(time * 0.42);
        const y = ((glyph.startY + time * glyph.speed + rowGap) % cycleHeight) - rowGap;
        const alpha = glyph.alpha * alphaScale;

        ctx.fillStyle = `rgba(245,245,240,${alpha})`;
        ctx.fillText(glyphAt(glyph.glyphSeed + glyphFrame * 7 + index * 3), x, y);

        if (glyph.trail > 0.42) {
          ctx.fillStyle = `rgba(245,245,240,${alpha * 0.25})`;
          ctx.fillText(glyphAt(glyph.glyphSeed + glyphFrame * 5 + 11), x, y - rowGap * 0.36);
        }
        if (glyph.trail > 0.67) {
          ctx.fillStyle = `rgba(245,245,240,${alpha * 0.13})`;
          ctx.fillText(glyphAt(glyph.glyphSeed + glyphFrame * 3 + 17), x, y - rowGap * 0.72);
        }
      });
    };

    const drawWord = (elapsed: number, overallLock: number) => {
      const time = elapsed / 1000;
      const cycleHeight = height + 120;
      const glyphFrame = Math.floor(elapsed / 64);
      const wordFinished = overallLock >= 1;
      ctx.font = `${glyphSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      wordGlyphs.forEach((glyph, index) => {
        const letterStart = rainLeadIn + glyph.letter * letterDuration;
        const lock = smoother((elapsed - letterStart) / letterDuration);
        const remaining = 1 - lock;

        const absoluteY = glyph.startY + time * glyph.speed;
        const targetCycle = Math.round((absoluteY - glyph.ty) / cycleHeight);
        const targetOnCycle = glyph.ty + targetCycle * cycleHeight;
        const lockedAbsoluteY = absoluteY + (targetOnCycle - absoluteY) * lock;
        const y = ((lockedAbsoluteY + 60) % cycleHeight) - 60;
        const x = glyph.tx + (
          Math.sin(time * 2.2 + glyph.phase) * 3.1
          + Math.sin(time * 5.8 + glyph.phase * 1.7) * 0.7
        ) * remaining;

        const movingSeed = glyph.glyphSeed + glyphFrame * 13 + index * 5;
        const stableSeed = glyph.glyphSeed + glyph.letter * 29;
        const character = glyphAt(wordFinished ? stableSeed : movingSeed);
        const pulse = wordFinished ? 0 : Math.sin(time * 7.5 + glyph.phase) * 0.04;
        const alpha = Math.min(0.98, 0.31 + glyph.brightness * 0.28 + lock * 0.38 + pulse);

        ctx.fillStyle = `rgba(245,245,240,${alpha})`;
        ctx.fillText(character, x, y);
      });
    };

    const drawMeta = (elapsed: number, overallLock: number) => {
      const frame = Math.floor(elapsed / 62);
      const topWord = overallLock >= 1
        ? 'JIMMY®'
        : scrambleToWord('JIMMY®', overallLock, frame);

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#f5f5f0';
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(topWord, 18, 22);

      if (overallLock >= 1) {
        ctx.textAlign = 'right';
        ctx.fillText('SCROLL TO ENTER', width - 18, 22);
      }

      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    };

    const draw = (now: number) => {
      const rawElapsed = now - startedAt;
      const elapsed = Math.min(rawElapsed, animationDuration);
      const overallLock = clamp((elapsed - rainLeadIn) / (letterDuration * letters.length));

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      drawRain(elapsed, 1 - overallLock * 0.74);
      drawWord(elapsed, overallLock);
      drawMeta(elapsed, overallLock);

      if (rawElapsed < animationDuration) {
        raf = requestAnimationFrame(draw);
      } else {
        setReady(true);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (dismissed) return null;

  const enter = () => {
    if (!ready || leaving) return;
    setLeaving(true);
    window.setTimeout(() => setDismissed(true), 850);
  };

  return (
    <div className={`ascii-intro-overlay${ready ? ' is-ready' : ''}${leaving ? ' is-leaving' : ''}`} aria-label="Jimmy introduction">
      <canvas ref={canvasRef} aria-hidden="true" />
      <button className="intro-scroll-cue" type="button" onClick={enter} aria-label="Enter website">
        SCROLL<br />↓
      </button>
    </div>
  );
}

export default function Home() {
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    if (window.location.hash) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);

    const resetToTop = () => window.scrollTo(0, 0);
    resetToTop();
    const frame = window.requestAnimationFrame(resetToTop);
    const timers = [0, 80, 250, 700].map((delay) => window.setTimeout(resetToTop, delay));
    window.addEventListener('pageshow', resetToTop);

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('pageshow', resetToTop);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.04, rootMargin: '0px 0px 8% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <style jsx global>{`
        .ascii-intro-overlay{position:fixed;inset:0;z-index:1000;background:#000;overflow:hidden;transform:translateY(0);will-change:transform;touch-action:none;transition:transform .85s cubic-bezier(.76,0,.24,1)}
        .ascii-intro-overlay.is-leaving{transform:translateY(-100%);pointer-events:none}
        .ascii-intro-overlay canvas{display:block;width:100%;height:100%}
        .intro-scroll-cue{position:absolute;left:50%;bottom:22px;transform:translateX(-50%) translateY(10px);border:0;background:transparent;color:#f5f5f0;font:8px/1.35 "Courier New",monospace;letter-spacing:.16em;text-align:center;opacity:0;transition:opacity .35s ease,transform .35s ease;cursor:pointer}
        .ascii-intro-overlay.is-ready .intro-scroll-cue{opacity:.78;transform:translateX(-50%) translateY(0)}
        .ascii-intro-overlay.is-leaving .intro-scroll-cue{opacity:0}
        .scramble-text{display:inline-block;min-width:max-content;font-variant-numeric:tabular-nums}
        .lookbook-info h2 .scramble-text{display:block}
        @media(prefers-reduced-motion:reduce){.ascii-intro-overlay{transition-duration:.35s}.intro-scroll-cue{opacity:.78;transform:translateX(-50%)}}
      `}</style>

      <AsciiIntro />

      <header className="nav">
        <a className="brand" href="#top">JIMMY®</a>
        <nav>
          <a href="#work"><ScrambleText text="WORK" className="scramble-text" /></a>
          <a href="#about"><ScrambleText text="ABOUT" className="scramble-text" /></a>
          <a href="#contact"><ScrambleText text="CONTACT" className="scramble-text" /></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="ascii-layer ascii-right" aria-hidden="true"><pre>{asciiTexture}</pre></div>
        <p className="hero-label hero-label-left">Fashion Designer</p>
        <p className="hero-label hero-label-right">Los Angeles · 2026</p>
        <h1 aria-label="Jimmy"><span>J</span><span>I</span><span>M</span><span>M</span><span>Y</span></h1>
        <div className="hero-image-wrap">
          <img className="hero-image" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90" alt="Fashion garments on a clothing rack" />
          <div className="dot-screen" aria-hidden="true" />
        </div>
        <p className="hero-statement">Selected collections<br />and garment studies.</p>
      </section>

      <section className="ticker"><div>FASHION DESIGN — COLLECTIONS — GARMENTS — FORM — TEXTURE — FASHION DESIGN — COLLECTIONS —</div></section>

      <section className="lookbook" id="work">
        <div className="section-head"><span>Selected Collections</span><span>2025—2026</span></div>
        <div className="lookbook-grid">
          {projects.map((project, index) => (
            <article className={`lookbook-card card-${index + 1}`} key={project.number} data-reveal>
              <div className="lookbook-image">
                <img src={project.image} alt={`${project.title} fashion collection`} />
                <div className="ascii-hover" aria-hidden="true"><pre>{asciiTexture}</pre></div>
              </div>
              <div className="lookbook-info">
                <span>{project.number}</span>
                <h2><ScrambleText text={project.title} className="scramble-text" /></h2>
                <p>{project.year}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ascii-break" aria-label="Animated fashion texture">
        <div className="ascii-track" aria-hidden="true"><pre>{asciiTexture}{asciiTexture}{asciiTexture}</pre></div>
        <p><ScrambleText text="FORM IN MOTION" className="scramble-text" /></p>
      </section>

      <section className="about" id="about" data-reveal>
        <span>About</span>
        <h2>Jimmy is a Los Angeles fashion designer focused on silhouette, structure, and movement.</h2>
      </section>

      <section className="contact" id="contact">
        <div className="contact-copy" data-reveal>
          <span>Get in touch</span>
          <h2>START A<br />PROJECT.</h2>
          <p>For custom pieces, collections, collaborations, and fashion inquiries.</p>
        </div>

        <form className="contact-form" action="mailto:hello@jimmy.studio" method="post" encType="text/plain" data-reveal>
          <label>Name<input type="text" name="name" required /></label>
          <label>Email<input type="email" name="email" required /></label>
          <label>Inquiry type<select name="inquiry" defaultValue="Custom piece"><option>Custom piece</option><option>Collection</option><option>Collaboration</option><option>Press</option><option>Other</option></select></label>
          <label>Message<textarea name="message" rows={5} required /></label>
          <button type="submit"><ScrambleText text="SEND INQUIRY ↗" className="scramble-text" /></button>
        </form>

        <footer><span>Jimmy © 2026</span><span>Instagram</span><span>Los Angeles</span></footer>
      </section>
    </main>
  );
}
