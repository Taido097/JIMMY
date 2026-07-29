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

type Particle = { x: number; y: number; sx: number; sy: number; tx: number; ty: number; size: number; char: string };

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
    let particles: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    const start = performance.now();
    const duration = 12800;
    const chars = '01.:;+=*#%@/\\-|';
    const ease = (p: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);

    const buildParticles = () => {
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const octx = off.getContext('2d');
      if (!octx) return;
      const fontSize = Math.min(width * 0.19, 270);
      octx.fillStyle = '#111';
      octx.font = `700 ${fontSize}px Arial`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText('JIMMY', width / 2, height / 2);
      const data = octx.getImageData(0, 0, width, height).data;
      const gap = width < 800 ? 8 : 7;
      particles = [];
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          if (data[(y * width + x) * 4 + 3] > 120) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.max(width, height) * (0.32 + Math.random() * 0.7);
            particles.push({
              x: width / 2 + Math.cos(angle) * radius,
              y: height / 2 + Math.sin(angle) * radius,
              sx: width / 2 + Math.cos(angle) * radius,
              sy: height / 2 + Math.sin(angle) * radius,
              tx: x,
              ty: y,
              size: 6 + Math.random() * 2,
              char: chars[Math.floor(Math.random() * chars.length)],
            });
          }
        }
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const drawMeta = () => {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#161616';
      ctx.font = '8px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('JIMMY®', 18, 22);
      ctx.textAlign = 'right';
      ctx.fillText('WORK   ABOUT   CONTACT', width - 18, 22);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(0, 0, width, height);
      drawMeta();

      // 0–2.4s: scattered particles drift inward.
      if (t < 2.4) {
        const p = ease(t / 2.4) * 0.35;
        particles.forEach((pt, i) => {
          const jitter = Math.sin(t * 3 + i * 0.17) * 10;
          const x = pt.sx + (pt.tx - pt.sx) * p + jitter;
          const y = pt.sy + (pt.ty - pt.sy) * p + Math.cos(t * 2 + i) * 8;
          ctx.globalAlpha = 0.22 + p * 0.8;
          ctx.font = `${pt.size}px "Courier New", monospace`;
          ctx.fillStyle = '#161616';
          ctx.fillText(pt.char, x, y);
        });
      }
      // 2.4–6.6s: a much stronger particle gather into JIMMY.
      else if (t < 6.6) {
        const p = ease((t - 2.4) / 4.2);
        particles.forEach((pt, i) => {
          const swirl = (1 - p) * 95;
          const x = pt.sx + (pt.tx - pt.sx) * p + Math.sin(i * 0.31 + t * 3) * swirl;
          const y = pt.sy + (pt.ty - pt.sy) * p + Math.cos(i * 0.23 + t * 2.4) * swirl * 0.55;
          ctx.globalAlpha = 0.32 + p * 0.68;
          ctx.font = `${pt.size}px "Courier New", monospace`;
          ctx.fillStyle = '#161616';
          ctx.fillText(pt.char, x, y);
        });
      }
      // 6.6–8.4s: hold the completed particle word.
      else if (t < 8.4) {
        const pulse = 1 + Math.sin((t - 6.6) * Math.PI) * 0.015;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(pulse, pulse);
        ctx.translate(-width / 2, -height / 2);
        particles.forEach((pt) => {
          ctx.globalAlpha = 0.96;
          ctx.font = `${pt.size}px "Courier New", monospace`;
          ctx.fillStyle = '#161616';
          ctx.fillText(pt.char, pt.tx, pt.ty);
        });
        ctx.restore();
      }
      // 8.4–11.8s: particles slowly open away from the center while hero fades in beneath.
      else {
        const p = ease((t - 8.4) / 3.4);
        particles.forEach((pt, i) => {
          const dx = pt.tx - width / 2;
          const dy = pt.ty - height / 2;
          const len = Math.max(1, Math.hypot(dx, dy));
          const spread = p * Math.max(width, height) * (0.75 + (i % 9) * 0.025);
          const x = pt.tx + (dx / len) * spread;
          const y = pt.ty + (dy / len) * spread + Math.sin(i * 0.19 + t * 4) * (1 - p) * 12;
          ctx.globalAlpha = Math.max(0, 1 - p * 1.12);
          ctx.font = `${pt.size}px "Courier New", monospace`;
          ctx.fillStyle = '#161616';
          ctx.fillText(pt.char, x, y);
        });
      }

      if (t * 1000 < duration) raf = requestAnimationFrame(draw);
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
        .ascii-intro{position:fixed;inset:0;z-index:1000;background:transparent;overflow:hidden;pointer-events:none;animation:introShellFade 3.4s ease 8.4s forwards}
        .ascii-intro canvas{display:block;width:100%;height:100%}
        .hero{animation:heroUnderIntro 3.4s ease 8.4s both}
        .scramble-text{display:inline-block;min-width:max-content;font-variant-numeric:tabular-nums}
        .lookbook-info h2 .scramble-text{display:block}
        @keyframes heroUnderIntro{from{opacity:.18;transform:scale(.985)}to{opacity:1;transform:none}}
        @keyframes introShellFade{0%{opacity:1}100%{opacity:0;visibility:hidden}}
        @media(prefers-reduced-motion:reduce){.ascii-intro{display:none}.hero{animation:none}}
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
