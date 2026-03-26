// Pixel-art infinity — thick chunky strokes, tiny holes, matching reference
export function ParticleHero() {
  // 16 cols x 10 rows — thick 3px strokes, small 2px holes
  const grid = [
    '.....##.........##.....',
    '....####.......####....',
    '..###..###...###..###..',
    '.###....###.###....###.',
    '###......##.##......###',
    '###.......###.......###',
    '.###....###.###....###.',
    '..###..###...###..###..',
    '....####.......####....',
    '.....##.........##.....',
  ];

  const cellSize = 11;
  const cols = grid[0].length;
  const rows = grid.length;
  const w = cols * cellSize;
  const h = rows * cellSize;

  const rects: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '#') {
        rects.push({ x: c * cellSize, y: r * cellSize });
      }
    }
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="currentColor"
      className="text-[var(--fg-muted)] opacity-20"
      aria-hidden="true"
    >
      {rects.map((rect, i) => (
        <rect key={i} x={rect.x} y={rect.y} width={cellSize} height={cellSize} />
      ))}
    </svg>
  );
}
