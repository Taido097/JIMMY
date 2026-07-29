'use client';

import { useEffect } from 'react';

const works = [
  {
    id: '01',
    title: 'VOID FORM',
    meta: 'Editorial / 2026',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90',
    alt: 'Editorial fashion model in a structured black outfit',
  },
  {
    id: '02',
    title: 'SILENT STRUCTURE',
    meta: 'Campaign / 2026',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=90',
    alt: 'Fashion model wearing a tailored neutral garment',
  },
  {
    id: '03',
    title: 'NOIR MOTION',
    meta: 'Runway / 2025',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90',
    alt: 'Contemporary fashion clothing displayed in a studio setting',
  },
];

export default function Home() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <div className="page-wipe" aria-hidden="true" />

      <header className="nav">
        <a className="brand" href="#top">JIMMY</a>
        <nav>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker hero-enter delay-1">Fashion Designer · Creative Direction · Los Angeles</div>
        <h1 className="hero-enter delay-2"><span>JIM</span><span>MY</span></h1>
        <div className="hero-art hero-enter delay-3">
          <img
            src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1800&q=90"
            alt="Avant-garde fashion model wearing a sculptural garment"
          />
          <div className="image-shade" />
        </div>
        <p className="hero-copy hero-enter delay-4">Clothing as image.<br />Movement as language.</p>
        <a className="scroll hero-enter delay-4" href="#work">Scroll to selected work ↓</a>
      </section>

      <section className="intro" data-reveal>
        <p>Jimmy develops image-led fashion stories across garment, styling, and creative direction.</p>
        <span>Selected work 2025—2026</span>
      </section>

      <section className="editorial-break" data-reveal>
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=90"
          alt="Editorial fashion portrait with flowing clothing"
        />
        <div className="editorial-caption">
          <span>Study 01</span>
          <p>Silhouette, tension, and the space between movement.</p>
        </div>
      </section>

      <section className="works" id="work">
        {works.map((work, index) => (
          <article className="work" key={work.id} data-reveal>
            <div className="work-image">
              <img src={work.image} alt={work.alt} loading={index === 0 ? 'eager' : 'lazy'} />
              <div className="work-overlay" />
            </div>
            <div className="work-info">
              <span>{work.id}</span>
              <h2>{work.title}</h2>
              <p>{work.meta}</p>
              <a href="#contact">View project ↗</a>
            </div>
          </article>
        ))}
      </section>

      <section className="detail-grid" data-reveal>
        <div className="detail-image tall">
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=90" alt="Model wearing a statement fashion look" />
        </div>
        <div className="detail-copy">
          <span>Garment Study</span>
          <h3>Texture becomes architecture.</h3>
        </div>
        <div className="detail-image short">
          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=90" alt="Close-up detail of luxury clothing fabric" />
        </div>
      </section>

      <section className="manifesto" id="about" data-reveal>
        <p className="eyebrow">About Jimmy</p>
        <h2>Fashion should leave a trace after the body exits the room.</h2>
        <div className="manifesto-grid">
          <p>Working between restraint and disruption, Jimmy creates fashion imagery shaped by silhouette, gesture, and atmosphere.</p>
          <p>Available for campaigns, editorial commissions, styling, runway concepts, and collaborative art direction.</p>
        </div>
      </section>

      <section className="contact" id="contact" data-reveal>
        <p>Have a project in mind?</p>
        <h2>LET’S CREATE<br />SOMETHING.</h2>
        <a href="mailto:hello@jimmy.studio">hello@jimmy.studio ↗</a>
        <footer><span>Jimmy © 2026</span><span>Instagram · Los Angeles</span></footer>
      </section>
    </main>
  );
}
