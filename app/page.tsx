'use client';

import { useEffect } from 'react';

const projects = [
  { number: '01', title: 'VOID FORM', type: 'Editorial', year: '2026', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85' },
  { number: '02', title: 'SILENT STRUCTURE', type: 'Campaign', year: '2026', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85' },
  { number: '03', title: 'NOIR MOTION', type: 'Runway', year: '2025', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85' },
];

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.14 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <div className="loader" aria-hidden="true"><span>JIMMY®</span></div>

      <header className="nav">
        <a className="brand" href="#top">JIMMY®</a>
        <p>Independent fashion practice<br />Los Angeles — 2026</p>
        <nav><a href="#work">Index</a><a href="#about">Info</a><a href="#contact">Contact</a></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true">{Array.from({ length: 24 }).map((_, i) => <i key={i} />)}</div>
        <p className="hero-label hero-label-left">Fashion / Image / Direction</p>
        <p className="hero-label hero-label-right">Scroll to unfold ↓</p>
        <h1 aria-label="Jimmy"><span>J</span><span>I</span><span>M</span><span>M</span><span>Y</span></h1>
        <div className="hero-image-wrap">
          <img className="hero-image" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90" alt="Editorial fashion clothing rack" />
          <div className="scanlines" />
        </div>
        <p className="hero-statement">Clothing as image.<br />Movement as language.</p>
      </section>

      <section className="ticker" aria-label="Fashion disciplines">
        <div>DESIGN — STYLING — IMAGE — MOVEMENT — GARMENT — DIRECTION — DESIGN — STYLING — IMAGE — MOVEMENT —</div>
      </section>

      <section className="statement" data-reveal>
        <span>( 01 / PRACTICE )</span>
        <p>Jimmy creates fashion worlds built from silhouette, tension, gesture, and restraint.</p>
      </section>

      <section className="index" id="work">
        <div className="index-head"><span>Selected work</span><span>2025—2026</span></div>
        {projects.map((project) => (
          <article className="project" key={project.number} data-reveal>
            <div className="project-line">
              <span>{project.number}</span><h2>{project.title}</h2><p>{project.type}<br />{project.year}</p><b>↗</b>
            </div>
            <div className="project-media"><img src={project.image} alt={`${project.title} fashion project`} /></div>
          </article>
        ))}
      </section>

      <section className="type-play" aria-label="Experimental typography">
        <div className="type-orbit">JIMMY JIMMY JIMMY JIMMY JIMMY JIMMY</div>
        <p>FORM<br />FOLLOWS<br />FEELING</p>
      </section>

      <section className="about" id="about" data-reveal>
        <div className="about-meta"><span>( 02 / PROFILE )</span><span>Los Angeles, CA</span></div>
        <h2>Not simply clothes.<br />A visual system for<br />how a body occupies space.</h2>
        <div className="about-copy">
          <p>Jimmy works across fashion design, styling, campaign concepts, editorial image-making, and creative direction.</p>
          <p>Available for selected commissions, collaborations, campaigns, and independent publications.</p>
        </div>
      </section>

      <section className="contact" id="contact">
        <p>( 03 / CONTACT )</p>
        <a href="mailto:hello@jimmy.studio">LET’S MAKE<br />AN IMAGE <span>↗</span></a>
        <footer><span>Jimmy © 2026</span><span>Instagram</span><span>Los Angeles</span></footer>
      </section>
    </main>
  );
}
