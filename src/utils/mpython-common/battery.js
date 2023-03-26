export const battery = () => {
  const snippet = [
    'batt_level = device.battery_level()',
    'display.text("batt: ", 0, 12, 0xffffff)',
    'display.hline(110, 12, 100, 0xffffff)',
    'display.vline(110, 12, 50, 0xffffff)',
    'display.hline(110, 32, batt_level, 0xffa500)',
    'display.hline(110, 34, batt_level, 0xffa500)',
    'display.hline(110, 36, batt_level, 0xffa500)',
    'display.hline(110, 38, batt_level, 0xffa500)',
    'display.hline(110, 40, batt_level, 0xffa500)',
    'display.hline(110, 60, 100, 0xffffff)',
    'display.vline(210, 12, 50, 0xffffff)',
    'display.text(str(batt_level) + "%", 230, 12, 0xffffff)'
  ];

  return snippet.join('\n');
}