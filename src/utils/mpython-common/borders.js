export const borders = (noSides = false) => {
  let snippet = [
    'display.line(0, 0, 640, 0, 0xffffff)',
    'display.line(0, 0, 0, 400, 0xffffff)',
    'display.line(640, 0, 640, 400, 0xffffff)',
    'display.line(0, 400, 640, 400, 0xffffff)'
  ];

  if (noSides) {
    snippet = [
      'display.hline(0, 0, 640, 0xffffff)',
      'display.hline(0, 392, 640, 0xffffff)'
    ]
  }

  return snippet.join('\n');
}