import { useEffect, useRef } from "react";

/**
 * Subtle animated career-network background: slowly drifting nodes connected
 * by faint pathway lines, with small dots travelling along the connections.
 * Pauses for reduced-motion users and hidden tabs; cheap on low-end devices.
 */
export function AnimatedBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 14;
    const nodes = Array.from({ length: N }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00016,
      r: 2 + Math.random() * 2.5,
      hue: i % 3, // 0 indigo, 1 emerald, 2 amber
    }));
    const travelers = Array.from({ length: 5 }, () => ({
      a: Math.floor(Math.random() * N),
      b: Math.floor(Math.random() * N),
      t: Math.random(),
      speed: 0.0018 + Math.random() * 0.002,
    }));

    const colors = ["oklch(0.55 0.18 275)", "oklch(0.62 0.15 160)", "oklch(0.78 0.15 70)"];

    const draw = () => {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
        if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
      }

      // connections
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = (nodes[i].x - nodes[j].x) * w;
          const dy = (nodes[i].y - nodes[j].y) * h;
          const dist = Math.hypot(dx, dy);
          const maxDist = 0.28 * Math.min(w, h);
          if (dist < maxDist) {
            ctx.strokeStyle = `oklch(0.55 0.18 275 / ${0.1 * (1 - dist / maxDist)})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
            ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
            ctx.stroke();
          }
        }
      }

      // travelling dots
      for (const t of travelers) {
        t.t += t.speed;
        if (t.t >= 1) {
          t.a = t.b;
          t.b = Math.floor(Math.random() * N);
          t.t = 0;
        }
        const x = (nodes[t.a].x + (nodes[t.b].x - nodes[t.a].x) * t.t) * w;
        const y = (nodes[t.a].y + (nodes[t.b].y - nodes[t.a].y) * t.t) * h;
        ctx.fillStyle = "oklch(0.62 0.15 160 / 0.5)";
        ctx.beginPath();
        ctx.arc(x, y, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = colors[n.hue].replace(")", " / 0.35)");
        ctx.beginPath();
        ctx.arc(n.x * w, n.y * h, n.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={"pointer-events-none absolute inset-0 h-full w-full " + className} />;
}
