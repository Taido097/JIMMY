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

type Particle = { sx: number; sy: number; tx: number; ty: number; phase: number; size: number };
type AmbientParticle = { x: number; y: number; phase: number; size: number };

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
    let particles: Particle[] = [];
    let ambient: AmbientParticle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let heroSize = 0;
    const centers = [0.065, 0.245, 0.44, 0.685, 0.925];
    const letters = ['J', 'I', 'M', 'M', 'Y'];
    const startedAt = performance.now();
    const animationDuration = 7600;
    const ease = (value: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, value)), 3);

    const buildParticles = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const octx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      heroSize = Math.min(width < 800 ? width * 0.27 : width * 0.22, 350);
      octx.fillStyle = '#fff';
      octx.font = `700 ${heroSize}px Arial`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      letters.forEach((letter, index) => octx.fillText(letter, width * centers[index], height * 0.5));
      const data = octx.getImageData(0, 0, width, height).data;
      const gap = width < 800 ? 6 : 7;
      const candidates: Particle[] = [];
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          if (data[(y * width + x) * 4 + 3] > 120) {
            const angle = Math.random() * Math.PI * 2;
            candidates.push({
              sx: width / 2 + Math.cos(angle) * width * (0.5 + Math.random() * 0.45),
              sy: height / 2 + Math.sin(angle) * height * (0.4 + Math.random() * 0.5),
              tx: x,
              ty: y,
              phase: Math.random() * Math.PI * 2,
              size: width < 800 ? 1.35 : 1.6,
            });
          }
        }
      }
      const maxParticles = width < 800 ? 3400 : 5000;
      const stride = Math.max(1, Math.ceil(candidates.length / maxParticles));
      particles = candidates.filter((_, index) => index % stride === 0).slice(0, maxParticles);
      ambient = Array.from({ length: width < 800 ? 420 : 780 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        phase: Math.random() * Math.PI * 2,
        size: 0.8 + Math.random() * 1.1,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const drawDots = (progress: number, alpha: number, jitterScale = 1) => {
      ctx.fillStyle = `rgba(245,245,240,${alpha})`;
      ctx.beginPath();
      particles.forEach((particle, index) => {
        const movement = ease(progress);
        const remaining = 1 - movement;
        const x = particle.sx + (particle.tx - particle.sx) * movement + Math.sin(particle.phase + index * 0.015 + progress * 5) * 38 * remaining * jitterScale;
        const y = particle.sy + (particle.ty - particle.sy) * movement + Math.cos(particle.phase + index * 0.011 + progress * 4) * 22 * remaining * jitterScale;
        ctx.rect(x, y, particle.size, particle.size);
      });
      ctx.fill();
    };

    const drawAmbient = (time: number, alpha: number) => {
      ctx.fillStyle = `rgba(245,245,240,${alpha})`;
      ctx.beginPath();
      ambient.forEach((particle) => ctx.rect(
        particle.x + Math.sin(time * 0.7 + particle.phase) * 10,
        particle.y + Math.cos(time * 0.55 + particle.phase) * 7,
        particle.size,
        particle.size,
      ));
      ctx.fill();
    };

    const drawScrambleWord = (progress: number, elapsed: number) => {
      const resolved = Math.min(5, Math.floor(progress * 5.8));
      const frame = Math.floor(elapsed / 42);
      ctx.save();
      ctx.font = `700 ${heroSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      letters.forEach((letter, index) => {
        const isResolved = index < resolved;
        const poolIndex = (frame * 7 + index * 13) % scrambleChars.length;
        const glyph = isResolved ? letter : scrambleChars[poolIndex];
        const remaining = 1 - progress;
        const jitterX = isResolved ? 0 : Math.sin(frame * 0.8 + index) * 13 * remaining;
        const jitterY = isResolved ? 0 : Math.cos(frame * 0.65 + index * 1.7) * 8 * remaining;
        ctx.globalAlpha = isResolved ? 0.28 + progress * 0.2 : 0.15 + progress * 0.2;
        ctx.fillStyle = '#f5f5f0';
        ctx.fillText(glyph, width * centers[index] + jitterX, height * 0.5 + jitterY);
      });
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    const drawFinalWord = () => {
      particles.forEach((particle) => {
        ctx.fillStyle = 'rgba(245,245,240,0.98)';
        ctx.fillRect(particle.tx, particle.ty, particle.size, particle.size);
      });
      ctx.save();
      ctx.font = `700 ${heroSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(245,245,240,0.16)';
      letters.forEach((letter, index) => ctx.fillText(letter, width * centers[index], height * 0.5));
      ctx.restore();
    };

    const drawMeta = () => {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#f5f5f0';
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('JIMMY®', 18, 22);
      ctx.textAlign = 'right';
      ctx.fillText('SCROLL TO ENTER', width - 18, 22);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    };

    const draw = (now: number) => {
      const elapsed = now - startedAt;
      const time = elapsed / 1000;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      if (elapsed < 1500) {
        const progress = elapsed / 1500;
        drawAmbient(time, 0.25);
        drawDots(progress * 0.2, 0.38 + progress * 0.25);
      } else if (elapsed < 4450) {
        const progress = (elapsed - 1500) / 2950;
        drawAmbient(time, 0.22 * (1 - progress));
        drawDots(0.2 + progress * 0.68, 0.68 + progress * 0.25);
      } else if (elapsed < 6350) {
        const progress = (elapsed - 4450) / 1900;
        drawDots(0.88 + progress * 0.12, 0.9 + progress * 0.08, 0.55);
        drawScrambleWord(progress, elapsed);
      } else {
        drawFinalWord();
      }

      drawMeta();
      if (elapsed < animationDuration) raf = requestAnimationFrame(draw);
      else setReady(true);
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
      <button className="intro-scroll-cue" type="button" onClick={enter} aria-label="Enter website">SCROLL<br />↓</button>
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
