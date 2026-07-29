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
  return <span ref={ref} className={className} aria-label={text} onMouseEnter={scramble} onFocus={scramble}>{text}</span>;
}

function AsciiIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const duration = 11500;
    const chars = '01.:;+=*#%@/\\-|';

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const textChar = (x: number, y: number, alpha = 1, size = 8) => {
      ctx.globalAlpha = alpha;
      ctx.font = `${size}px "Courier New", monospace`;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
    };

    const ellipseField = (cx: number, cy: number, rx: number, ry: number, density: number, phase: number, alpha = .7) => {
      for (let y = -ry; y <= ry; y += density) {
        const width = rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)));
        for (let x = -width; x <= width; x += density) {
          const wave = Math.sin((x + phase * 120) * .035 + y * .02) * 4;
          textChar(cx + x, cy + y + wave, alpha * (0.55 + Math.random() * .45), 7);
        }
      }
    };

    const silhouette = (cx: number, cy: number, scale: number, pose: number, alpha = .75) => {
      const headR = 20 * scale;
      ellipseField(cx, cy - 150 * scale, headR, headR * 1.15, 5 * scale, pose, alpha);
      ellipseField(cx, cy - 40 * scale, 56 * scale, 115 * scale, 6 * scale, pose + 1, alpha);
      ellipseField(cx - 32 * scale, cy + 85 * scale, 20 * scale, 105 * scale, 6 * scale, pose + 2, alpha);
      ellipseField(cx + 32 * scale, cy + 85 * scale, 20 * scale, 105 * scale, 6 * scale, pose + 3, alpha);
    };

    const drawWord = (word: string, y: number, progress: number) => {
      const fontSize = Math.min(window.innerWidth * .19, 260);
      ctx.save();
      ctx.font = `700 ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const metrics = ctx.measureText(word);
      const startX = (window.innerWidth - metrics.width) / 2;
      ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(18,18,18,.08)';
      ctx.strokeText(word, startX, y);
      for (let yy = y - fontSize * .42; yy < y + fontSize * .42; yy += 7) {
        for (let xx = startX; xx < startX + metrics.width; xx += 7) {
          const sample = Math.sin(xx * .02 + yy * .017 + progress * 8);
          if (sample > -.15) textChar(xx, yy, .78, 7);
        }
      }
      ctx.restore();
    };

    const draw = (now: number) => {
      const elapsed = now - start;
      const t = elapsed / 1000;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = '#161616';

      ctx.globalAlpha = 1;
      ctx.font = '8px "Courier New", monospace';
      ctx.fillText('JIMMY', 18, 20);
      ctx.fillText('WORK  ABOUT  CONTACT', window.innerWidth - 150, 20);

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      if (t < 1.6) {
        const p = t / 1.6;
        ellipseField(cx, cy - 190, 80 + p * 85, 18 + p * 12, 6, t, .72);
        ellipseField(cx, cy, 35 + p * 120, 45 + p * 25, 6, -t, .8);
        ellipseField(cx, cy + 190, 85 + p * 110, 18 + p * 14, 6, t * 1.5, .72);
      } else if (t < 3.3) {
        const p = (t - 1.6) / 1.7;
        ellipseField(cx, cy, 160 + p * window.innerWidth * .35, 70 + p * 105, 6, t, .55 + p * .2);
      } else if (t < 4.4) {
        const p = (t - 3.3) / 1.1;
        for (let i = 0; i < 1800; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * (80 + p * window.innerWidth * .55);
          textChar(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * .38, (1 - p) * .7, 7);
        }
      } else if (t < 5.6) {
        drawWord('jimmy', cy, (t - 4.4) / 1.2);
      } else if (t < 6.8) {
        const p = (t - 5.6) / 1.2;
        const cols = 5;
        for (let c = 0; c < cols; c++) {
          const x = (c + .5) * window.innerWidth / cols;
          const h = window.innerHeight * (.25 + .55 * Math.abs(Math.sin(c + p * 2)));
          for (let y = cy - h / 2; y < cy + h / 2; y += 7) textChar(x, y, .72, 7);
        }
      } else if (t < 9.4) {
        const p = (t - 6.8) / 2.6;
        silhouette(window.innerWidth * .22, cy + 35, .82, t, .55 + p * .2);
        silhouette(window.innerWidth * .50, cy + 25, 1.0, t + 1, .68 + p * .18);
        silhouette(window.innerWidth * .78, cy + 40, .78, t + 2, .52 + p * .18);
        for (let i = 0; i < 900; i++) {
          const y = window.innerHeight * (.65 + Math.random() * .35);
          textChar(Math.random() * window.innerWidth, y, .25 + Math.random() * .28, 7);
        }
      } else if (t < 10.7) {
        const p = (t - 9.4) / 1.3;
        ellipseField(cx - window.innerWidth * .18, cy, 120 + p * window.innerWidth * .55, 95 + p * 170, 6, t, .62);
        ellipseField(cx + window.innerWidth * .24, cy + 20, 90 + p * window.innerWidth * .45, 75 + p * 150, 6, -t, .5);
      } else {
        const p = Math.min(1, (t - 10.7) / .8);
        ctx.globalAlpha = 1 - p;
      }

      if (elapsed < duration) raf = requestAnimationFrame(draw);
      else setDone(true);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (done) return null;
  return <div className="ascii-intro" aria-hidden="true"><canvas ref={canvasRef} /></div>;
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
      { threshold: 0.04, rootMargin: '0px 0px 8% 0px' }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <style jsx global>{`
        .ascii-intro{position:fixed;inset:0;z-index:1000;background:#f5f5f0;overflow:hidden}
        .ascii-intro canvas{display:block;width:100%;height:100%}
        .scramble-text{display:inline-block;min-width:max-content;font-variant-numeric:tabular-nums}
        .lookbook-info h2 .scramble-text{display:block}
        @media(prefers-reduced-motion:reduce){.ascii-intro{display:none}}
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
              <div className="lookbook-info"><span>{project.number}</span><h2><ScrambleText text={project.title} className="scramble-text" /></h2><p>{project.year}</p></div>
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
