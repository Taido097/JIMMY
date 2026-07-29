'use client';

import { useEffect } from 'react';

const projects = [
  { number: '01', title: 'VOID FORM', year: '2026', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85' },
  { number: '02', title: 'SILENT STRUCTURE', year: '2026', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=85' },
  { number: '03', title: 'NOIR MOTION', year: '2025', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85' },
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
        <p>Fashion Designer<br />Los Angeles</p>
        <nav><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true">{Array.from({ length: 24 }).map((_, i) => <i key={i} />)}</div>
        <p className="hero-label hero-label-left">Fashion Designer</p>
        <p className="hero-label hero-label-right">Scroll ↓</p>
        <h1 aria-label="Jimmy"><span>J</span><span>I</span><span>M</span><span>M</span><span>Y</span></h1>
        <div className="hero-image-wrap">
          <img className="hero-image" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90" alt="Fashion collection by Jimmy" />
          <div className="scanlines" />
        </div>
        <p className="hero-statement">Form. Fabric. Movement.</p>
      </section>

      <section className="ticker" aria-label="Fashion design">
        <div>COLLECTIONS — GARMENTS — SILHOUETTES — COLLECTIONS — GARMENTS — SILHOUETTES —</div>
      </section>

      <section className="index" id="work">
        <div className="index-head"><span>Selected Collections</span><span>2025—2026</span></div>
        {projects.map((project) => (
          <article className="project" key={project.number} data-reveal>
            <div className="project-line">
              <span>{project.number}</span><h2>{project.title}</h2><p>{project.year}</p><b>↗</b>
            </div>
            <div className="project-media"><img src={project.image} alt={`${project.title} collection`} /></div>
          </article>
        ))}
      </section>

      <section className="type-play" aria-label="Jimmy fashion designer">
        <div className="type-orbit">JIMMY JIMMY JIMMY JIMMY JIMMY JIMMY</div>
        <p>FORM<br />IN<br />MOTION</p>
      </section>

      <section className="about" id="about" data-reveal>
        <div className="about-meta"><span>About</span><span>Los Angeles, CA</span></div>
        <h2>Jimmy is a fashion designer focused on silhouette, proportion, and movement.</h2>
      </section>

      <section className="contact" id="contact">
        <p>Contact</p>
        <a href="mailto:hello@jimmy.studio">GET IN<br />TOUCH <span>↗</span></a>
        <footer><span>Jimmy © 2026</span><span>Instagram</span><span>Los Angeles</span></footer>
      </section>
    </main>
  );
}
