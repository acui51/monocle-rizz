export const date = (ymdDateStr) => {
  const snippet = [
    `display.text("${ymdDateStr}", 425, 10, 0xffffff)`,
  ];

  return snippet.join('\n');
}