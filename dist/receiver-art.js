(() => {
  const prop = document.querySelector('.receiver');
  const canvas = prop.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const photo = new Image();

  function paint() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height || !photo.naturalWidth) return;
    const density = Math.min(devicePixelRatio, 1.75);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);

    const pixelScale = canvas.width / photo.naturalWidth;
    const join = Math.round(photo.naturalHeight * .56);
    const head = Math.round(join * pixelScale);
    const extra = canvas.height - photo.naturalHeight * pixelScale;
    context.drawImage(photo, 0, 0, photo.naturalWidth, join, 0, 0, canvas.width, head);

    const length = photo.naturalHeight - join;
    // Stretch the cloth lead progressively, starting at its natural scale by the coupling.
    const lineAt = (offset) => Math.round(head + offset * pixelScale + extra * (offset / length) ** 2);
    for (let offset = 0; offset < length; offset += 3) {
      const end = Math.min(offset + 3, length);
      const from = lineAt(offset);
      const to = lineAt(end);
      if (to > from) context.drawImage(photo, 0, join + offset, photo.naturalWidth, end - offset,
        0, from, canvas.width, to - from);
    }
  }

  photo.addEventListener('load', paint, { once: true });
  photo.src = './receiver-complete.webp?v=14';
  new ResizeObserver(paint).observe(prop);
})();
