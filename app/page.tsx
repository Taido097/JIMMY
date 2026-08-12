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
const introChars = 'NO0A869452I3?!<>=+/:-· ';
const introSolidChars = 'NO0A869452I3?!<>=+/:-·';

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

  useEffect(() => () => stop(), []);

  return (
    <span ref={ref} className={className} aria-label={text} onMouseEnter={scramble} onFocus={scramble}>
      {text}
    </span>
  );
}

type IntroPoint = {
  x: number;
  y: number;
  value: string;
  seed: number;
};

type TargetPoint = IntroPoint;

type MorphPoint = {
  sx: number;
  sy: number;
  bx: number;
  by: number;
  tx: number;
  ty: number;
  value: string;
  targetValue: string;
  seed: number;
  delay: number;
};

function AsciiIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const begin = () => triggerRef.current?.();
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 2) begin();
    };
    const onTouchMove = (event: TouchEvent) => event.preventDefault();
    const onKeyDown = (event: KeyboardEvent) => {
      if (['Enter', 'ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) {
        event.preventDefault();
        begin();
      } else if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown, { passive: false });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dismissed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startedAt = performance.now();
    const burstDuration = 200;
    const morphDuration = 1700;
    const holdDuration = 1400;
    const exitDuration = 2000;
    const exitFadeDelay = 160;

    let raf = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cellW = 7.5;
    let cellH = 15;
    let fontSize = 11.2;
    let cols = 1;
    let rows = 1;
    let pointerX = width * 0.5;
    let pointerY = height * 0.5;
    let pointerTargetX = pointerX;
    let pointerTargetY = pointerY;
    let pointerSeen = false;
    let readySignaled = false;
    let leaveSignaled = false;
    let dismissSignaled = false;
    let phase: 'ambient' | 'sequence' = 'ambient';
    let phaseStarted = 0;
    let targets: TargetPoint[] = [];
    let particles: MorphPoint[] = [];

    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const smoother = (value: number) => {
      const p = clamp(value);
      return p * p * p * (p * (p * 6 - 15) + 10);
    };
    const easeOut = (value: number) => {
      const p = clamp(value);
      return 1 - Math.pow(1 - p, 3);
    };
    const fract = (value: number) => value - Math.floor(value);
    const hash = (seed: number) => fract(Math.sin(seed * 12.9898) * 43758.5453);
    const glyphAt = (seed: number) => introChars[Math.abs(Math.floor(seed)) % introChars.length];
    const solidGlyphAt = (seed: number) => introSolidChars[Math.abs(Math.floor(seed)) % introSolidChars.length];
    const interpolateGlyph = (from: string, to: string, progress: number) => {
      const fromIndex = Math.max(0, introSolidChars.indexOf(from));
      const toIndex = Math.max(0, introSolidChars.indexOf(to));
      const index = Math.round(fromIndex + (toIndex - fromIndex) * clamp(progress));
      return introSolidChars[Math.max(0, Math.min(introSolidChars.length - 1, index))];
    };

    const configureGrid = () => {
      const mobile = width < 800;
      cellW = mobile ? 6.7 : 7.55;
      cellH = mobile ? 13.4 : 15.05;
      fontSize = mobile ? 10.3 : 11.35;
      cols = Math.max(1, Math.ceil(width / cellW));
      rows = Math.max(1, Math.ceil(height / cellH));
    };

    const buildTargets = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = Math.max(1, Math.floor(width));
      offscreen.height = Math.max(1, Math.floor(height));
      const octx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!octx) return [] as TargetPoint[];

      let logoSize = Math.min(height * 0.36, width * 0.26);
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.font = `900 ${logoSize}px Arial, Helvetica, sans-serif`;
      while (octx.measureText('JIMMY').width > width * 0.82 && logoSize > 26) {
        logoSize *= 0.95;
        octx.font = `900 ${logoSize}px Arial, Helvetica, sans-serif`;
      }

      octx.clearRect(0, 0, width, height);
      octx.fillStyle = '#181818';
      octx.fillText('JIMMY', width * 0.5, height * 0.5);

      const data = octx.getImageData(0, 0, offscreen.width, offscreen.height).data;
      const sampleX = width < 800 ? 5.2 : 6.7;
      const sampleY = width < 800 ? 8.0 : 9.8;
      const next: TargetPoint[] = [];

      for (let y = 0; y < height; y += sampleY) {
        for (let x = 0; x < width; x += sampleX) {
          const px = Math.min(offscreen.width - 1, Math.max(0, Math.floor(x)));
          const py = Math.min(offscreen.height - 1, Math.max(0, Math.floor(y)));
          if (data[(py * offscreen.width + px) * 4 + 3] < 80) continue;
          const seed = x * 0.37 + y * 0.71;
          next.push({
            x,
            y,
            value: solidGlyphAt(seed * 3.7 + 17),
            seed,
          });
        }
      }

      const maxTargets = width < 800 ? 1900 : 2800;
      const stride = Math.max(1, Math.ceil(next.length / maxTargets));
      return next.filter((_, index) => index % stride === 0).slice(0, maxTargets);
    };

    const ambientPoints = (elapsed: number) => {
      const points: IntroPoint[] = [];
      const time = elapsed / 1000;
      const reveal = smoother(elapsed / 3000);
      const pointerShift = ((pointerX / Math.max(width, 1)) - 0.5) * 0.14;
      const pointerRow = pointerY / Math.max(height, 1) * rows;

      for (let row = 1; row < rows - 1; row += 1) {
        const rowWave = (Math.sin(time * 0.92 + row * 0.285) + 1) * 0.5;
        const slowWave = (Math.sin(time * 0.31 - row * 0.112) + 1) * 0.5;
        const pointerInfluence = Math.exp(-Math.pow((row - pointerRow) / Math.max(5, rows * 0.12), 2));
        const span = cols * (0.035 + reveal * (0.22 + rowWave * 0.2 + slowWave * 0.11));
        const center = cols * (0.5 + pointerShift * (0.45 + pointerInfluence * 0.75))
          + Math.sin(time * 0.53 + row * 0.19) * cols * 0.035;
        const half = Math.max(1, span * 0.5);
        const start = Math.max(0, Math.floor(center - half));
        const end = Math.min(cols - 1, Math.ceil(center + half));

        for (let col = start; col <= end; col += 1) {
          const normalized = (col - center) / half;
          const edge = clamp(1 - Math.abs(normalized));
          const interference = 0.5 + 0.5 * Math.cos(
            normalized * Math.PI * (3.0 + slowWave * 2.6)
            - time * 2.35
            + row * 0.137
            + pointerShift * 8.5,
          );
          const grain = 0.5 + 0.5 * Math.sin(col * 0.53 + row * 0.37 - time * 1.65);
          const energy = clamp(edge * 0.65 + interference * 0.27 + grain * 0.08);
          const index = Math.floor((1 - energy) * (introChars.length - 1));
          const value = introChars[Math.max(0, Math.min(introChars.length - 1, index))];
          if (!value.trim()) continue;

          points.push({
            x: col * cellW + cellW * 0.5,
            y: row * cellH + cellH * 0.5,
            value,
            seed: row * cols + col,
          });
        }
      }
      return points;
    };

    const sortPoints = <T extends IntroPoint>(items: T[]) => items.slice().sort((a, b) => {
      const rowDiff = a.y - b.y;
      return Math.abs(rowDiff) > cellH * 0.4 ? rowDiff : a.x - b.x;
    });

    const normalize = <T extends IntroPoint>(items: T[], count: number) => {
      if (!items.length) return [] as T[];
      return Array.from({ length: count }, (_, index) => items[Math.min(
        items.length - 1,
        Math.floor(index * items.length / count),
      )]);
    };

    const makeMorph = (elapsed: number) => {
      const source = sortPoints(ambientPoints(elapsed));
      const target = sortPoints(targets);
      if (!source.length || !target.length) return;

      const maxCount = width < 800 ? 1900 : 2800;
      const count = Math.min(maxCount, Math.max(1000, source.length, target.length));
      const sources = normalize(source, count);
      const targetSet = normalize(target, count);
      const burstSeconds = burstDuration / 1000;
      const maxDistance = Math.hypot(width, height);

      particles = sources.map((point, index) => {
        const targetPoint = targetSet[index];
        const horizontal = (point.x / Math.max(width, 1) - 0.5) * 2;
        const vx = horizontal * 145 + (hash(point.seed + 13) - 0.5) * 78;
        const vy = -65 - hash(point.seed + 19) * 115;
        const distance = Math.hypot(targetPoint.x - point.x, targetPoint.y - point.y);
        return {
          sx: point.x,
          sy: point.y,
          bx: point.x + vx * burstSeconds,
          by: point.y + vy * burstSeconds + 0.5 * 260 * burstSeconds * burstSeconds,
          tx: targetPoint.x,
          ty: targetPoint.y,
          value: point.value,
          targetValue: targetPoint.value,
          seed: point.seed + targetPoint.seed + index * 0.17,
          delay: hash(point.seed + index * 0.31) * 95 + distance / maxDistance * 80,
        };
      });
    };

    const drawBackground = () => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(0, 0, width, height);
    };

    const setMono = () => {
      ctx.font = `500 ${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    };

    const drawIntroChrome = (elapsed: number, showPointerLabel: boolean) => {
      ctx.fillStyle = '#181818';
      ctx.font = `500 ${Math.max(9, fontSize - 0.8)}px "Courier New", monospace`;
      ctx.textBaseline = 'middle';

      if (elapsed < 1000) {
        const progress = smoother(elapsed / 1000);
        const lineCols = Math.floor((cols - 5) * progress);
        ctx.textAlign = 'left';
        for (let index = 0; index < lineCols; index += 1) {
          ctx.fillText('=', 18 + index * cellW, 22);
        }
      } else {
        const alpha = smoother((elapsed - 1000) / 650);
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'left';
        ctx.fillText('JIMMY®', 18, 22);
        if (width >= 700) {
          ctx.textAlign = 'center';
          ctx.fillText('FASHION DESIGNER', width * 0.5, 22);
        }
        ctx.textAlign = 'right';
        ctx.fillText('LOS ANGELES · 2026', width - 18, 22);
        ctx.globalAlpha = 1;
      }

      if (showPointerLabel && pointerSeen && width >= 800) {
        ctx.globalAlpha = 0.92;
        ctx.textAlign = 'left';
        ctx.fillText('CLICK', Math.min(width - 52, pointerX + 12), Math.max(34, pointerY - 12));
        ctx.globalAlpha = 1;
      }
    };

    const drawAmbient = (elapsed: number) => {
      drawBackground();
      setMono();
      const points = ambientPoints(elapsed);
      ctx.fillStyle = '#181818';
      ctx.globalAlpha = 0.97;
      points.forEach((point) => ctx.fillText(point.value, point.x, point.y));
      ctx.globalAlpha = 1;
      drawIntroChrome(elapsed, readySignaled);
    };

    const drawTargetStatic = () => {
      drawBackground();
      setMono();
      ctx.fillStyle = '#181818';
      targets.forEach((point) => ctx.fillText(point.value, point.x, point.y));
      drawIntroChrome(1800, false);
    };

    const drawSequence = (now: number) => {
      drawBackground();
      setMono();
      const elapsed = now - phaseStarted;
      const morphStart = burstDuration;
      const holdStart = morphStart + morphDuration;
      const exitStart = holdStart + holdDuration;
      const totalDuration = exitStart + exitDuration;

      particles.forEach((particle) => {
        let x = particle.sx;
        let y = particle.sy;
        let alpha = 0.98;
        let value = particle.value;

        if (elapsed < morphStart) {
          const p = easeOut(elapsed / burstDuration);
          x = particle.sx + (particle.bx - particle.sx) * p;
          y = particle.sy + (particle.by - particle.sy) * p;
          value = glyphAt(particle.seed + Math.floor(elapsed / 48) * 5);
        } else if (elapsed < holdStart) {
          const local = Math.max(0, elapsed - morphStart - particle.delay);
          const raw = clamp(local / Math.max(1, morphDuration - particle.delay));
          const p = 1 - Math.pow(1 - smoother(raw), 1.8);
          x = particle.bx + (particle.tx - particle.bx) * p;
          y = particle.by + (particle.ty - particle.by) * p;
          value = interpolateGlyph(particle.value, particle.targetValue, smoother((raw - 0.08) / 0.82));
          alpha = 0.88 + p * 0.12;
        } else if (elapsed < exitStart) {
          x = particle.tx;
          y = particle.ty;
          value = particle.targetValue;
          alpha = 1;
        } else {
          const localElapsed = elapsed - exitStart;
          const p = smoother(localElapsed / exitDuration);
          const dx = particle.tx - width * 0.5;
          const dy = particle.ty - height * 0.5;
          const scale = 1 + p * 5.6;
          const angle = (hash(particle.seed + 41) - 0.5) * 0.16 * p;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          const waveX = Math.sin(particle.seed * 0.023 + p * 11) * 36 * p;
          const waveY = Math.cos(particle.seed * 0.017 + p * 9) * 26 * p;
          x = width * 0.5 + rx * scale + waveX;
          y = height * 0.5 + ry * scale + waveY;
          value = p < 0.28
            ? particle.targetValue
            : glyphAt(particle.seed + Math.floor(localElapsed / 88) * 7);
          alpha = Math.max(0, 1 - smoother((p - 0.28) / 0.72) * 0.78);

          if (localElapsed >= exitFadeDelay && !leaveSignaled) {
            leaveSignaled = true;
            setLeaving(true);
          }
        }

        if (alpha <= 0.01) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#181818';
        ctx.fillText(value, x, y);
      });
      ctx.globalAlpha = 1;

      if (elapsed < exitStart) drawIntroChrome(1800, false);

      if (elapsed >= totalDuration && !dismissSignaled) {
        dismissSignaled = true;
        setDismissed(true);
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      configureGrid();
      targets = buildTargets();
    };

    const beginMorph = () => {
      if (phase !== 'ambient' || !readySignaled) return;
      const now = performance.now();
      makeMorph(now - startedAt);
      if (!particles.length) return;
      phase = 'sequence';
      phaseStarted = now;
      setStarted(true);
    };
    triggerRef.current = beginMorph;

    const onPointerMove = (event: PointerEvent) => {
      pointerTargetX = event.clientX;
      pointerTargetY = event.clientY;
      pointerSeen = true;
    };

    const draw = (now: number) => {
      pointerX += (pointerTargetX - pointerX) * 0.085;
      pointerY += (pointerTargetY - pointerY) * 0.085;

      if (phase === 'ambient') {
        const elapsed = now - startedAt;
        drawAmbient(elapsed);
        if (elapsed >= 1150 && !readySignaled) {
          readySignaled = true;
          setReady(true);
        }
      } else {
        drawSequence(now);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    if (reducedMotion) {
      drawTargetStatic();
      readySignaled = true;
      setReady(true);
      triggerRef.current = () => {
        if (leaveSignaled) return;
        leaveSignaled = true;
        setStarted(true);
        setLeaving(true);
        window.setTimeout(() => setDismissed(true), 350);
      };
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      triggerRef.current = null;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  if (dismissed) return null;

  const begin = () => {
    if (!ready || started || leaving) return;
    triggerRef.current?.();
  };

  return (
    <div
      className={`ascii-intro-overlay${ready ? ' is-ready' : ''}${started ? ' is-started' : ''}${leaving ? ' is-leaving' : ''}`}
      aria-label="Jimmy introduction"
      onPointerDown={begin}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="intro-enter-cue" aria-hidden="true">
        <span className="intro-desktop-cue">CLICK TO CONTINUE</span>
        <span className="intro-mobile-cue">TAP TO CONTINUE</span>
      </div>
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
        .ascii-intro-overlay{position:fixed;inset:0;z-index:1000;background:#f5f5f0;overflow:hidden;touch-action:none;opacity:1;will-change:opacity;transition:opacity 1.8s cubic-bezier(1,.02,.37,.97);cursor:default}
        .ascii-intro-overlay.is-leaving{opacity:0;pointer-events:none}
        .ascii-intro-overlay canvas{display:block;width:100%;height:100%;pointer-events:none}
        .intro-enter-cue{position:absolute;left:50%;bottom:22px;transform:translateX(-50%) translateY(8px);color:#181818;font:500 9px/1.35 "Courier New",monospace;letter-spacing:.12em;white-space:nowrap;opacity:0;transition:opacity .35s ease,transform .35s ease;pointer-events:none}
        .ascii-intro-overlay.is-ready:not(.is-started) .intro-enter-cue{opacity:.8;transform:translateX(-50%) translateY(0)}
        .ascii-intro-overlay.is-started .intro-enter-cue,.ascii-intro-overlay.is-leaving .intro-enter-cue{opacity:0}
        .intro-mobile-cue{display:none}
        .scramble-text{display:inline-block;min-width:max-content;font-variant-numeric:tabular-nums}
        .lookbook-info h2 .scramble-text{display:block}
        @media(hover:hover) and (pointer:fine){.ascii-intro-overlay.is-ready:not(.is-started){cursor:none}}
        @media(max-width:799px){.intro-desktop-cue{display:none}.intro-mobile-cue{display:inline}.intro-enter-cue{bottom:18px;font-size:9px}}
        @media(prefers-reduced-motion:reduce){.ascii-intro-overlay{transition-duration:.35s}.ascii-intro-overlay.is-ready:not(.is-started) .intro-enter-cue{opacity:.8;transform:translateX(-50%)}}
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
