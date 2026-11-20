function createBreathSmoke(canvas) {
  const context = canvas.getContext('2d');
  const stamp = document.createElement('canvas');
  stamp.width = stamp.height = 128;
  const ink = stamp.getContext('2d');
  if (!context || !ink) return { breathe() {}, clear() {} };
  const rings = [
    [57, 62, 50, .41], [71, 49, 37, .29], [44, 83, 35, .26], [83, 79, 35, .24], [92, 54, 22, .13]
  ];
  rings.forEach(([x, y, radius, opacity]) => {
    const haze = ink.createRadialGradient(x, y, 2, x, y, radius);
    haze.addColorStop(0, `rgba(217,222,217,${opacity})`);
    haze.addColorStop(.42, `rgba(185,200,203,${opacity * .59})`);
    haze.addColorStop(1, 'rgba(160,185,196,0)');
    ink.fillStyle = haze;
    ink.fillRect(0, 0, 128, 128);
  });

  let frame = 0;
  let particles = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 0;
  let direction = -1;

  function draw(time) {
    context.clearRect(0, 0, width, height);
    particles = particles.filter((particle) => time < particle.start + particle.life);
    context.globalCompositeOperation = 'screen';
    for (const particle of particles) {
      const age = (time - particle.start) / particle.life;
      if (age <= 0) continue;
      const lift = Math.min(height * .95, 1050);
      const drift = age * (.36 + age * .64);
      const radius = (particle.size + age * particle.spread) * Math.min(1.25, width / 900 + .36);
      const x = width * .55 + particle.wind * drift + Math.sin(age * 7 + particle.phase) * age * 74;
      const y = height + 34 - lift * (1 - (1 - age) ** 1.65) * particle.speed;
      context.save();
      context.translate(x, y);
      context.rotate(particle.phase + age * .85);
      context.globalAlpha = Math.sin(Math.PI * age) ** 1.45 * particle.opacity;
      context.drawImage(stamp, -radius, -radius * .7, radius * 2, radius * 1.4);
      context.restore();
    }
    frame = particles.length ? requestAnimationFrame(draw) : 0;
  }

  function breathe() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    if (width !== bounds.width || height !== bounds.height || pixelRatio !== density) {
      width = bounds.width;
      height = bounds.height;
      pixelRatio = density;
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
    }
    direction *= -1;
    const now = performance.now();
    for (let index = 0; index < 56; index += 1) {
      particles.push({
        start: now + index * 17,
        life: 4000 + Math.random() * 1550,
        wind: direction * (35 + Math.random() * Math.min(210, width * .29)) + (Math.random() - .5) * width * .52,
        speed: .48 + Math.random() * .64,
        phase: Math.random() * Math.PI * 2,
        size: 20 + Math.random() * 34,
        spread: 145 + Math.random() * 185,
        opacity: .21 + Math.random() * .24
      });
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function clear() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    particles = [];
    context.clearRect(0, 0, width, height);
  }

  return { breathe, clear };
}
