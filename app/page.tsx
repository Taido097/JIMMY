const works = [
  { id: '01', title: 'Afterimage', meta: 'Editorial / 2026', className: 'work work-a' },
  { id: '02', title: 'Soft Armor', meta: 'Campaign / 2026', className: 'work work-b' },
  { id: '03', title: 'Nocturne', meta: 'Runway / 2025', className: 'work work-c' },
];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top">JIMMY</a>
        <nav>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-kicker">Fashion Designer · Creative Direction · Los Angeles</div>
        <h1><span>JIM</span><span>MY</span></h1>
        <div className="hero-art" aria-label="Abstract editorial fashion artwork">
          <div className="figure" />
          <div className="orb orb-one" />
          <div className="orb orb-two" />
        </div>
        <p className="hero-copy">Clothing as image.<br />Movement as language.</p>
        <a className="scroll" href="#work">Scroll to selected work ↓</a>
      </section>

      <section className="intro">
        <p>Jimmy develops image-led fashion stories across garment, styling, and creative direction.</p>
        <span>Selected work 2025—2026</span>
      </section>

      <section className="works" id="work">
        {works.map((work) => (
          <article className={work.className} key={work.id}>
            <div className="work-image"><div className="silhouette" /></div>
            <div className="work-info">
              <span>{work.id}</span>
              <h2>{work.title}</h2>
              <p>{work.meta}</p>
              <a href="#contact">View project ↗</a>
            </div>
          </article>
        ))}
      </section>

      <section className="manifesto" id="about">
        <p className="eyebrow">About Jimmy</p>
        <h2>Fashion should leave a trace after the body exits the room.</h2>
        <div className="manifesto-grid">
          <p>Working between restraint and disruption, Jimmy creates fashion imagery shaped by silhouette, gesture, and atmosphere.</p>
          <p>Available for campaigns, editorial commissions, styling, runway concepts, and collaborative art direction.</p>
        </div>
      </section>

      <section className="contact" id="contact">
        <p>Have a project in mind?</p>
        <h2>LET’S CREATE<br />SOMETHING.</h2>
        <a href="mailto:hello@jimmy.studio">hello@jimmy.studio ↗</a>
        <footer><span>Jimmy © 2026</span><span>Instagram · Los Angeles</span></footer>
      </section>
    </main>
  );
}
