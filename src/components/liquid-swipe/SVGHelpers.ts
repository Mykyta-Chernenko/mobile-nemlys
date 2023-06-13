export const moveTo = (commands: string[], x: number, y: number) => {
  'worklet';
  commands.push(`M${x},${y} `);
};

export const lineTo = (commands: string[], x: number, y: number) => {
  'worklet';
  commands.push(`L${x},${y} `);
};

interface Point {
  x: number;
  y: number;
}

interface Curve {
  to: Point;
  c1: Point;
  c2: Point;
}

export const curveTo = (commands, c: Curve) => {
  'worklet';
  commands.push(`C${c.c1.x},${c.c1.y} ${c.c2.x},${c.c2.y} ${c.to.x},${c.to.y} `);
};

export const close = (commands) => {
  'worklet';
  commands.push('Z');
};
