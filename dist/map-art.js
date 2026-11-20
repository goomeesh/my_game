document.querySelectorAll('.map-engraving').forEach((canvas) => {
  const ink = canvas.getContext('2d');
  if (!ink) return;
  let seed = isPapinyCase ? 1890 : 1897;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function line(points, color, width, closed = false) {
    ink.beginPath();
    points.forEach(([x, y], index) => index ? ink.lineTo(x, y) : ink.moveTo(x, y));
    if (closed) ink.closePath();
    ink.strokeStyle = color;
    ink.lineWidth = width;
    ink.stroke();
  }

  function handwriting(text, x, y, angle = 0, size = 19) {
    ink.save();
    ink.translate(x, y);
    ink.rotate(angle);
    ink.fillStyle = '#4c4839';
    ink.font = `italic ${size}px Georgia, serif`;
    ink.fillText(text, 0, 0);
    ink.restore();
  }

  ink.lineJoin = 'round';
  ink.lineCap = 'round';
  for (let contour = 0; contour < 8; contour += 1) {
    const path = new Path2D(`M 21 ${34 + contour * 15} Q ${100 + contour * 7} ${50 + contour * 18} ${82 + contour * 9} ${126 + contour * 12} T 41 ${255 + contour * 9}`);
    ink.strokeStyle = contour % 3 === 0 ? '#87735173' : '#97794f44';
    ink.lineWidth = contour % 3 === 0 ? 1.3 : .8;
    ink.stroke(path);
  }
  const fields = [
    [[38, 345], [116, 326], [171, 363], [154, 430], [63, 439]],
    [[34, 445], [152, 443], [145, 532], [111, 561], [36, 539]],
    [[159, 490], [208, 524], [243, 577], [172, 630], [121, 573]]
  ];
  fields.forEach((field) => {
    const path = new Path2D();
    field.forEach(([x, y], index) => index ? path.lineTo(x, y) : path.moveTo(x, y));
    path.closePath();
    ink.fillStyle = '#80845b23';
    ink.fill(path);
    ink.strokeStyle = '#6c66455e';
    ink.lineWidth = 1.2;
    ink.stroke(path);
    ink.save();
    ink.clip(path);
    for (let x = 28; x < 247; x += 13) line([[x, 332], [x + 45, 633]], '#6f66452e', .8);
    ink.restore();
  });
  const river = new Path2D('M 203 -10 C 119 111 301 173 243 281 C 184 393 173 443 263 520 C 340 584 341 629 322 693');
  ink.strokeStyle = '#726a4a';
  ink.lineWidth = 66;
  ink.stroke(river);
  ink.strokeStyle = '#8d9b89';
  ink.lineWidth = 61;
  ink.stroke(river);
  ink.strokeStyle = '#c0c4a5';
  ink.lineWidth = 50;
  ink.stroke(river);
  ink.save();
  ink.strokeStyle = '#697f727a';
  ink.lineWidth = 1.5;
  ink.setLineDash([18, 14, 4, 20]);
  ink.stroke(river);
  ink.restore();

  ink.strokeStyle = '#76674577';
  ink.lineWidth = 1;
  ink.strokeRect(14, 14, 1052, 652);
  ink.strokeRect(20, 20, 1040, 640);

  for (let index = 0; index < 71; index += 1) {
    const x = 29 + random() * 135;
    const y = 341 + random() * 210;
    const radius = 2 + random() * 3;
    ink.beginPath();
    ink.ellipse(x, y, radius, radius * .77, -.3, 0, 2 * Math.PI);
    ink.strokeStyle = '#60624787';
    ink.lineWidth = .9;
    ink.stroke();
    line([[x, y + radius], [x + 1, y + radius + 3]], '#60624787', .9);
  }

  const blocks = [
    [348, 156, 91, 47], [461, 159, 99, 47], [586, 163, 81, 44], [695, 177, 87, 42],
    [345, 223, 82, 63], [451, 226, 73, 66], [553, 229, 119, 54], [705, 237, 91, 56],
    [333, 312, 83, 52], [449, 314, 86, 39], [562, 308, 87, 45], [681, 310, 91, 58],
    [816, 255, 101, 44], [823, 325, 92, 49], [932, 286, 55, 86],
    [335, 399, 69, 48], [441, 392, 70, 40], [530, 384, 90, 41], [645, 398, 65, 43]
  ];
  blocks.forEach(([x, y, width, height], index) => {
    const boundary = [[x, y + (random() - .5) * 11], [x + width, y + (random() - .5) * 9],
      [x + width - 2, y + height - 2], [x + 1, y + height + (random() - .5) * 9]];
    line(boundary, '#67553f88', 1.15, true);
    const columns = index % 4 + 3;
    const step = width / columns;
    for (let column = 0; column < columns; column += 1) {
      const buildingX = x + 3 + column * step + random() * 3;
      const first = y + 5 + random() * 5;
      const second = y + height * (.54 + random() * .08);
      const footprint = Math.max(4, step - 4 - random() * 4);
      const depth = height * (.17 + random() * .15);
      ink.fillStyle = ['#713d378a', '#84664d9d', '#9a6c4983'][column % 3];
      ink.fillRect(buildingX, first, footprint, depth);
      if (random() > .16) ink.fillRect(buildingX + 2, second, footprint * .83, depth * .9);
      line([[buildingX, first + depth], [buildingX + footprint, first + depth]], '#4c382d7c', .7);
      if (column) line([[x + column * step, y + 1], [x + column * step - 1, y + height - 1]], '#765d4240', .7);
    }
  });

  const roads = [
    [[68, 296], [178, 295], [273, 306], [331, 299], [560, 298], [779, 298], [987, 310], [1080, 320]],
    [[301, 374], [430, 376], [583, 365], [715, 382], [841, 390], [1015, 394]],
    [[430, 111], [443, 211], [439, 301], [427, 444], [455, 554], [496, 662]],
    [[580, 91], [572, 143], [536, 211], [541, 296], [529, 377], [535, 440]],
    [[804, 142], [812, 219], [803, 307], [788, 412], [755, 476]],
    [[292, 190], [343, 211], [530, 211], [707, 226], [916, 228], [1025, 256]]
  ];
  roads.forEach((road, index) => {
    line(road, '#96774b', index === 0 ? 15 : 9);
    line(road, '#e5c99a', index === 0 ? 11 : 6);
  });

  const railway = [[203, 667], [364, 574], [538, 511], [732, 473], [927, 446], [1080, 441]];
  line(railway, '#4e4438', 9);
  line(railway, '#d6bb8b', 3);
  railway.slice(1).forEach(([x, y], index) => {
    const [fromX, fromY] = railway[index];
    const length = Math.hypot(x - fromX, y - fromY);
    for (let distance = 10; distance < length; distance += 13) {
      const fx = fromX + distance * (x - fromX) / length;
      const fy = fromY + distance * (y - fromY) / length;
      line([[fx - 2, fy - 7], [fx + 2, fy + 7]], '#57483b', 1.7);
    }
  });
  ink.fillStyle = '#9b6d58';
  ink.fillRect(735, 424, 123, 30);
  ink.strokeStyle = '#55392f';
  ink.strokeRect(735, 424, 123, 30);

  line([[839, 448], [866, 487], [935, 498]], '#725948', 2);
  handwriting(isPapinyCase ? 'Канал' : 'р. Блэк', 194, 407, -1.08, 25);
  handwriting(isPapinyCase ? 'Рыночная улица' : 'Вокзальная улица', 469, 280, .02);
  handwriting('Старые сады', 42, 407, -.09, 20);
  handwriting('Рыночный квартал', 593, 123, .045, 20);
  handwriting(isPapinyCase ? 'Южная дорога' : 'Железная дорога', 574, 562, -.18, 23);
  handwriting(isPapinyCase ? 'к почтовой станции' : 'к товарным складам', 809, 535, .14, 18);

  ink.save();
  ink.translate(963, 108);
  line([[0, -44], [21, 7], [0, -3], [-21, 7], [0, -44]], '#5b4735', 2, true);
  line([[0, -33], [0, 34], [-21, 7], [21, 7]], '#5b4735', 1.4);
  handwriting('С', -7, -50, 0, 20);
  ink.restore();
});
