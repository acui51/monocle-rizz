export const touch = () => {
  const snippet = [
    'def callbackA(arg):',
    '  print("trigger a")',
    'def callbackB(arg):',
    '  print("trigger b")',
    `touch.callback(touch.A, callbackA)`,
    `touch.callback(touch.B, callbackB)`
  ];

  return snippet.join('\n');
}