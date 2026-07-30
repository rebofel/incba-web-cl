/* ============================================
   INCBA — Aurora Flow Field
   Organic gradient wave canvas
   ============================================ */

(function () {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, time = 0, cols, rows;
  const CELL = 20;
  const SPEED = 0.0008;
  let mouse = { x: -1000, y: -1000 };
  const MOUSE_R = 200;

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
    cols = Math.ceil(w / CELL) + 1;
    rows = Math.ceil(h / CELL) + 1;
  }

  // Simplex-like noise via layered sine (fast, no lib needed)
  function noise(x, y, t) {
    return (
      Math.sin(x * 0.012 + t * 0.7) *
      Math.cos(y * 0.018 - t * 0.5) *
      0.5 +
      Math.sin(x * 0.008 - y * 0.006 + t * 1.1) * 0.3 +
      Math.cos(x * 0.022 + y * 0.014 + t * 0.4) * 0.2
    );
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    time += SPEED;

    // — Layer 1: flowing gradient ribbons —
    for (let r = 0; r < 5; r++) {
      ctx.beginPath();
      const yOff = h * (0.15 + r * 0.18);
      const amp = 50 + r * 15;
      const phase = r * 1.2;

      for (let x = 0; x <= w; x += 4) {
        const n = noise(x, yOff + r * 60, time * 1000 + phase);
        const y = yOff + n * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      const alpha = 0.025 + (r % 2 === 0 ? 0.015 : 0);
      ctx.strokeStyle = r < 3
        ? `rgba(0, 200, 150, ${alpha})`
        : `rgba(0, 140, 220, ${alpha * 0.7})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // — Layer 2: flow field streamlines —
    const streamCount = 40;
    for (let s = 0; s < streamCount; s++) {
      // Deterministic seed position per stream
      const sx = ((s * 7919) % 1000) / 1000 * w;
      const sy = ((s * 6271) % 1000) / 1000 * h;
      let px = sx, py = sy;

      ctx.beginPath();
      ctx.moveTo(px, py);

      const steps = 30;
      for (let i = 0; i < steps; i++) {
        const angle = noise(px, py, time * 1000) * Math.PI * 2;

        // Mouse repulsion
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        let mx = 0, my = 0;
        if (md < MOUSE_R && md > 0) {
          const force = (1 - md / MOUSE_R) * 2;
          mx = (dx / md) * force;
          my = (dy / md) * force;
        }

        px += Math.cos(angle) * CELL * 0.5 + mx;
        py += Math.sin(angle) * CELL * 0.5 + my;
        ctx.lineTo(px, py);

        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) break;
      }

      const fade = 0.06 + (s % 5 === 0 ? 0.04 : 0);
      ctx.strokeStyle = s % 3 === 0
        ? `rgba(0, 140, 220, ${fade * 0.6})`
        : `rgba(0, 200, 150, ${fade})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // — Layer 3: glow nodes at intersections —
    const nodeCount = 12;
    for (let n = 0; n < nodeCount; n++) {
      const nx = ((n * 3571 + 137) % 1000) / 1000 * w;
      const ny = ((n * 2143 + 419) % 1000) / 1000 * h;
      const pulse = Math.sin(time * 1000 * 0.3 + n * 0.9) * 0.5 + 0.5;
      const rad = 2 + pulse * 2;
      const alpha = 0.15 + pulse * 0.2;

      ctx.beginPath();
      ctx.arc(nx, ny, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 150, ${alpha})`;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(0, 200, 150, ${alpha * 0.8})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', resize);

  resize();
  draw();
})();
