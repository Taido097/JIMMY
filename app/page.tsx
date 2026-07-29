'use client';

import { useEffect } from 'react';

const projects = [
  { number: '01', title: 'VOID FORM', year: '2026', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85' },
  { number: '02', title: 'SILENT STRUCTURE', year: '2026', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85' },
  { number: '03', title: 'NOIR MOTION', year: '2025', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85' },
];

const asciiFigure = `
        .........
      ..:::::::::..
     .:::::@@::::::.
     :::::@@@@::::::
      :::@@@@@@:::
       ::@@@@@@::
        :@@@@@@:
       .:@@@@@@:.
      .::@@@@@@::.
     .:::@@@@@@:::.
    .::::@@@@@@::::.
   .:::::@@@@@@:::::.
  .::::::@@@@@@::::::.
 .:::::::@@@@@@:::::::.
:::::::::@@@@@@:::::::::
        @@@@@@@@
        @@@@@@@@
        @@@@@@@@
`;

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

export default function Home() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    scrollToTop();
    const frame = window.requestAnimationFrame(scrollToTop);

    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.04, rootMargin: '0px 0px 8% 0px' }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <main>
      <div className="loader" aria-hidden="true"><span>JIMMY®</span></div>

      <header className="nav">
        <a className="brand" href="#top">JIMMY®</a>
        <nav><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      </header>

      <section className="hero" id="top">
        <div className="ascii-layer ascii-left" aria-hidden="true"><pre>{asciiFigure}</pre></div>
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
                <div className="ascii-hover" aria-hidden="true"><pre>{index === 1 ? asciiTexture : asciiFigure}</pre></div>
              </div>
              <div className="lookbook-info"><span>{project.number}</span><h2>{project.title}</h2><p>{project.year}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="ascii-break" aria-label="Animated fashion texture">
        <div className="ascii-track" aria-hidden="true">
          <pre>{asciiTexture}{asciiTexture}{asciiTexture}</pre>
        </div>
        <p>FORM IN MOTION</p>
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
          <button type="submit">Send inquiry ↗</button>
        </form>

        <footer><span>Jimmy © 2026</span><span>Instagram</span><span>Los Angeles</span></footer>
      </section>
    </main>
  );
}
