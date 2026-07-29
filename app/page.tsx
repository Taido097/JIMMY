'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

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

const introField = `
..............................................................................
..::..::....::::....::..::....::::....::..::....::::....::..::....::::......
..............................................................................
///// FORM_01 ///// GARMENT_02 ///// MOTION_03 ///// ARCHIVE_04 /////
..............................................................................
..::..::....::::....::..::....::::....::..::....::::....::..::....::::......
..............................................................................
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
      ref.current.textContent = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index / text.length < progress) return char;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        })
        .join('');

      frame += 1;
      if (frame > totalFrames) stop();
    }, 28);
  };

  useEffect(() => stop, []);

  return <span ref={ref} className={className} aria-label={text} onMouseEnter={scramble} onFocus={scramble}>{text}</span>;
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
    window.addEventListener('load', resetToTop);
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('pageshow', resetToTop);
      window.removeEventListener('load', resetToTop);
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
        .loader{display:block;overflow:hidden;animation:introExit 1s cubic-bezier(.76,0,.24,1) 2.65s forwards}
        .intro-grid{position:absolute;color:#f5f5f0;opacity:.28;overflow:hidden;white-space:pre;pointer-events:none}
        .intro-grid pre{margin:0;font:7px/.8 "Courier New",monospace;letter-spacing:-.08em}
        .intro-grid-a{inset:-8% -4% auto -4%;height:48%;animation:introFieldA 2.4s steps(12,end) both}
        .intro-grid-b{inset:auto -8% -10% 28%;height:46%;transform:rotate(4deg);animation:introFieldB 2.4s steps(12,end) both}
        .intro-center{position:absolute;inset:0;display:grid;place-content:center;text-align:center;z-index:3}
        .intro-center strong{display:block;font-size:clamp(76px,18vw,280px);line-height:.72;letter-spacing:-.095em;font-weight:700;animation:introTitle 1.25s cubic-bezier(.16,1,.3,1) .3s both}
        .intro-index,.intro-status{font:9px/1.2 "Courier New",monospace;letter-spacing:.16em;text-transform:uppercase}
        .intro-index{margin-bottom:18px;animation:introMeta .55s ease .15s both}
        .intro-status{margin-top:22px;animation:introMeta .55s ease .8s both}
        .intro-progress{position:absolute;left:24px;right:24px;bottom:24px;height:1px;background:rgba(245,245,240,.18)}
        .intro-progress i{display:block;height:100%;background:#f5f5f0;transform-origin:left;animation:introProgress 2.35s cubic-bezier(.65,0,.35,1) .15s both}
        .scramble-text{display:inline-block;min-width:max-content;font-variant-numeric:tabular-nums}
        .lookbook-info h2 .scramble-text{display:block}
        @keyframes introFieldA{0%{transform:translate3d(-8%,-18%,0);opacity:0}25%{opacity:.34}100%{transform:translate3d(9%,9%,0);opacity:.18}}
        @keyframes introFieldB{0%{transform:rotate(4deg) translate3d(12%,18%,0);opacity:0}25%{opacity:.3}100%{transform:rotate(4deg) translate3d(-10%,-8%,0);opacity:.14}}
        @keyframes introTitle{0%{opacity:0;transform:scaleY(.05) translateY(80px);filter:blur(8px)}55%{opacity:1;filter:blur(0)}100%{transform:none}}
        @keyframes introMeta{from{opacity:0;transform:translateY(12px)}to{opacity:.8;transform:none}}
        @keyframes introProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes introExit{0%{clip-path:inset(0 0 0 0)}100%{clip-path:inset(0 0 100% 0);visibility:hidden}}
        @media(max-width:800px){.intro-grid pre{font-size:5px}.intro-progress{left:16px;right:16px;bottom:16px}.intro-center strong{font-size:24vw}}
        @media(prefers-reduced-motion:reduce){.loader{display:none}}
      `}</style>

      <div className="loader" aria-hidden="true">
        <div className="intro-grid intro-grid-a"><pre>{introField}{introField}{introField}</pre></div>
        <div className="intro-grid intro-grid-b"><pre>{introField}{introField}</pre></div>
        <div className="intro-center">
          <span className="intro-index">JIMMY / 2026</span>
          <strong>JIMMY</strong>
          <span className="intro-status">FASHION DESIGNER — LOADING ARCHIVE</span>
        </div>
        <div className="intro-progress"><i /></div>
      </div>

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
