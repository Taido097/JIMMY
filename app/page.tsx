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

const diamond = `
                         ..
                      ..::::..
                  ...::::::::::...
              ....::::::::::::::::....
          .....::::::::::::::::::::::::.....
      ......::::::::::::::::::::::::::::::::......
  .......::::::::::::::::::::::::::::::::::::::::.......
      ......::::::::::::::::::::::::::::::::......
          .....::::::::::::::::::::::::.....
              ....::::::::::::::::....
                  ...::::::::::...
                      ..::::..
                         ..
`;

const particleField = `
.. . ....  . . .. ... . .  ....  .  .. . .... . . . ..
 . ... . .. .... . . ... .. .  .. . ... . . .. .... .
...  . . .. .  .... .. . . ... . .. .  ... . .. . ...
 . .. ... . . .... .  .. ... . .  ... . .. . . .... .
.. . . ... .. . . ... . ..  .... . . ... .. .  .. ...
`;

const silhouettes = `
        ........                 ........                 ........
      ..::::::::..             ..::::::::..             ..::::::::..
     .::::@@@@::::.           .::::@@@@::::.           .::::@@@@::::.
      :::@@@@@@:::             :::@@@@@@:::             :::@@@@@@:::
       ::@@@@@@::               ::@@@@@@::               ::@@@@@@::
        :@@@@@@:                 :@@@@@@:                 :@@@@@@:
       .:@@@@@@:.               .:@@@@@@:.               .:@@@@@@:.
      .::@@@@@@::.             .::@@@@@@::.             .::@@@@@@::.
     .:::@@@@@@:::.           .:::@@@@@@:::.           .:::@@@@@@:::.
    .::::@@@@@@::::.         .::::@@@@@@::::.         .::::@@@@@@::::.
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
        .loader{display:block;overflow:hidden;background:#f5f5f0;color:#111;animation:introExit .9s cubic-bezier(.76,0,.24,1) 8.7s forwards}
        .intro-scene{position:absolute;inset:0;display:grid;place-items:center;opacity:0;pointer-events:none}
        .intro-scene pre{margin:0;font-family:"Courier New",monospace;white-space:pre;text-align:center}
        .intro-meta{position:absolute;top:16px;left:18px;right:18px;display:flex;justify-content:space-between;font:8px/1 "Courier New",monospace;letter-spacing:.12em;text-transform:uppercase;z-index:5}
        .scene-diamond{animation:sceneDiamond 2.25s steps(14,end) .1s both}
        .scene-diamond pre{font-size:clamp(5px,.55vw,9px);line-height:.72;letter-spacing:-.08em;animation:diamondGrow 2.15s cubic-bezier(.16,1,.3,1) both}
        .scene-noise{animation:sceneNoise 1.45s steps(9,end) 2.05s both}
        .scene-noise pre{position:absolute;inset:-20%;font-size:8px;line-height:1.2;letter-spacing:.25em;white-space:pre-wrap;animation:noiseRise 1.5s linear both}
        .scene-word{animation:sceneWord 2.05s steps(12,end) 3.15s both;overflow:hidden}
        .scene-word strong{font-family:Arial,Helvetica,sans-serif;font-size:clamp(110px,28vw,430px);line-height:.68;letter-spacing:-.12em;text-transform:lowercase;color:transparent;-webkit-text-stroke:1px #111;background-image:repeating-linear-gradient(to bottom,#111 0 1px,transparent 1px 4px);-webkit-background-clip:text;background-clip:text;animation:wordAssemble 1.9s cubic-bezier(.16,1,.3,1) both}
        .scene-columns{animation:sceneColumns 1.75s steps(10,end) 5.0s both;overflow:hidden}
        .scene-columns pre{font-size:clamp(5px,.48vw,8px);line-height:.76;letter-spacing:-.08em;transform:scaleY(1.25);animation:columnsShift 1.7s ease-in-out both}
        .scene-silhouettes{animation:sceneSilhouettes 2.05s steps(12,end) 6.45s both;overflow:hidden}
        .scene-silhouettes pre{font-size:clamp(5px,.5vw,8px);line-height:.76;letter-spacing:-.08em;animation:silhouetteResolve 1.8s cubic-bezier(.16,1,.3,1) both}
        .intro-caption{position:absolute;bottom:18px;left:18px;right:18px;display:flex;justify-content:space-between;font:8px/1 "Courier New",monospace;letter-spacing:.14em;text-transform:uppercase;z-index:5}
        .scramble-text{display:inline-block;min-width:max-content;font-variant-numeric:tabular-nums}
        .lookbook-info h2 .scramble-text{display:block}
        @keyframes diamondGrow{0%{opacity:0;transform:scale(.08) rotate(45deg);filter:blur(3px)}35%{opacity:1}70%{transform:scale(1.4) rotate(0)}100%{transform:scale(2.1);opacity:.95}}
        @keyframes sceneDiamond{0%,88%{opacity:1}100%{opacity:0}}
        @keyframes noiseRise{from{transform:translateY(25%);opacity:0}25%{opacity:.75}to{transform:translateY(-20%);opacity:0}}
        @keyframes sceneNoise{0%,12%{opacity:0}25%,75%{opacity:1}100%{opacity:0}}
        @keyframes wordAssemble{0%{opacity:0;transform:scaleX(1.65) skewX(-12deg);filter:blur(7px)}45%{opacity:1;filter:blur(0)}100%{transform:none}}
        @keyframes sceneWord{0%,8%{opacity:0}18%,82%{opacity:1}100%{opacity:0}}
        @keyframes columnsShift{0%{opacity:0;transform:scaleY(.15) translateY(30%)}35%{opacity:1}100%{transform:scaleY(1.25) translateY(-4%)}}
        @keyframes sceneColumns{0%,8%{opacity:0}20%,82%{opacity:1}100%{opacity:0}}
        @keyframes silhouetteResolve{0%{opacity:0;transform:translateY(18%) scaleX(1.4);filter:blur(5px)}40%{opacity:1;filter:blur(0)}100%{transform:none}}
        @keyframes sceneSilhouettes{0%,8%{opacity:0}20%,88%{opacity:1}100%{opacity:0}}
        @keyframes introExit{0%{clip-path:inset(0)}100%{clip-path:inset(0 0 100% 0);visibility:hidden}}
        @media(max-width:800px){.scene-word strong{font-size:31vw}.scene-columns pre,.scene-silhouettes pre{font-size:4px}.intro-meta,.intro-caption{font-size:6px}}
        @media(prefers-reduced-motion:reduce){.loader{display:none}}
      `}</style>

      <div className="loader" aria-hidden="true">
        <div className="intro-meta"><span>JIMMY / 2026</span><span>FASHION DESIGN</span><span>LOS ANGELES</span></div>
        <div className="intro-scene scene-diamond"><pre>{diamond}</pre></div>
        <div className="intro-scene scene-noise"><pre>{particleField.repeat(9)}</pre></div>
        <div className="intro-scene scene-word"><strong>jimmy</strong></div>
        <div className="intro-scene scene-columns"><pre>{asciiTexture.repeat(8)}</pre></div>
        <div className="intro-scene scene-silhouettes"><pre>{silhouettes}</pre></div>
        <div className="intro-caption"><span>FORM / GARMENT / MOTION</span><span>ARCHIVE LOADING</span></div>
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
        <div className="contact-copy" data-reveal><span>Get in touch</span><h2>START A<br />PROJECT.</h2><p>For custom pieces, collections, collaborations, and fashion inquiries.</p></div>
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
