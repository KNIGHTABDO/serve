'use client';

/* Three abstract hand-coded SVG glyphs for the feature trio rows. */

export function WaveformGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: 22 }).map((_, i) => {
        const h = Number((4 + Math.abs(Math.sin(i * 0.9)) * 26 + (i % 3) * 2).toFixed(2));
        return (
          <rect
            key={i}
            x={Number((i * 5.4).toFixed(2))}
            y={Number(((40 - h) / 2).toFixed(2))}
            width="2.2"
            height={h}
            rx="1"
            className="feature-glyph"
            stroke="rgba(237,232,223,0.45)"
            fill="rgba(237,232,223,0.18)"
            strokeWidth="0.5"
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

export function NodeClusterGlyph({ className = '' }: { className?: string }) {
  const nodes = [
    [12, 20], [30, 8], [42, 28], [58, 14], [70, 32], [86, 22], [104, 10], [110, 30],
  ];
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {nodes.map(([x1, y1], i) =>
        nodes.slice(i + 1).map(([x2, y2], j) => {
          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist > 28) return null;
          return (
            <line
              key={`${i}-${j}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="feature-glyph"
              stroke="rgba(237,232,223,0.35)"
              strokeWidth="0.4"
              opacity="0.6"
            />
          );
        })
      )}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 2.4 : 1.6}
          className="feature-glyph"
          stroke="rgba(237,232,223,0.6)"
          fill="rgba(12,12,13,1)"
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}

export function SpiralGlyph({ className = '' }: { className?: string }) {
  // Archimedean-ish spiral (precomputed-style, deterministic)
  const points: string[] = [];
  const STEPS = 184;
  for (let i = 0; i < STEPS; i++) {
    const t = (i * 7 * Math.PI) / STEPS;
    const r = t * 1.05;
    const x = 60 + r * Math.cos(t);
    const y = 20 + r * Math.sin(t) * 0.55;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg
      width="120"
      height="40"
      viewBox="0 0 120 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={points.join(' ')}
        className="feature-glyph"
        stroke="rgba(237,232,223,0.45)"
        fill="none"
        strokeWidth="0.6"
        opacity="0.75"
      />
    </svg>
  );
}

export function GitHubIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.78.12 3.07.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.26 5.68.41.35.77 1.05.77 2.12v3.15c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}

export function XIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.59 8.67L22.5 22H15.7l-5.32-6.97L4.3 22H1.04l8.12-9.27L1.5 2h6.9l4.81 6.36L18.244 2zm-1.19 18h1.83L7.06 4h-1.9l11.894 16z" />
    </svg>
  );
}

export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
