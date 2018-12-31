const fs = require('fs');
const TinyQueue = require('tinyqueue');

const inputPath = 'input.txt';
let canPaint = false;
const debug = (...message) => {
  // enable this to debug
  if (false) console.log(...message);
};
const paint = (...message) => {
  // enable this to visualize
  if (canPaint) console.log(...message);
};

const SQUARE_TYPE = {
  UNKNOWN : '?',
  MOUTH   : 'M',
  TARGET  : 'T',
  ROCKY   : '.',
  WET     : '=',
  NARROW  : '|'
};

const EQUIPMENT_TYPE = {
  NEITHER       : 0,
  TORCH         : 1,
  CLIMBING_GEAR : 2
};

const EQUIPMENT = {
  0 : 'NEITHER',
  1 : 'TORCH',
  2 : 'CLIMBING_GEAR'
};

let cave;
let minX = Number.MAX_SAFE_INTEGER;
let maxX = Number.MIN_SAFE_INTEGER;
let minY = Number.MAX_SAFE_INTEGER;
let maxY = Number.MIN_SAFE_INTEGER;

class Square {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this._type = type;
  }

  toString() {
    return `[ ${this.x},${this.y} ${this.type} ]`;
  }

  get key() {
    return Square.createKey(this.x, this.y);
  }

  static createKey(x, y) {
    return `${x}|${y}`;
  }

  get geologicIndex() {
    return cave.getGeologicIndex(this.x, this.y);
  }

  get erosionLevel() {
    return (this.geologicIndex + cave.depth) % 20183;
  }

  get type() {
    let type = this.erosionLevel % 3;
    switch (type) {
      case 0:
        return SQUARE_TYPE.ROCKY;
      case 1:
        return SQUARE_TYPE.WET;
      case 2:
        return SQUARE_TYPE.NARROW;
      default:
        throw new Error('this cannot happen');
    }
  }

  get riskLevel() {
    switch (this.type) {
      case SQUARE_TYPE.ROCKY:
        return 0;
      case SQUARE_TYPE.WET:
        return 1;
      case SQUARE_TYPE.NARROW:
        return 2;
      default:
        return 0;
    }
  }
}

class Cave {
  constructor(depth) {
    this.squareMap = new Map();
    this.geologicIndexMap = new Map();
    this.depth = depth;
  }

  getOrCreateSquare(x, y, type = SQUARE_TYPE.UNKNOWN) {
    const key = Square.createKey(x, y);
    if (!this.squareMap.has(key)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      this.squareMap.set(key, new Square(x, y, type));
    }
    return this.squareMap.get(key);
  }

  getSquare(x, y) {
    const key = Square.createKey(x, y);
    return this.squareMap.get(key);
  }

  getGeologicIndex(x, y) {
    const key = Square.createKey(x, y);
    if (!this.geologicIndexMap.has(key)) {
      let geologicIndex = 0;
      const square = this.squareMap.get(key);
      if (square._type === SQUARE_TYPE.MOUTH || square._type === SQUARE_TYPE.TARGET) {
        geologicIndex = 0
      } else if (square.y === 0) {
        geologicIndex = 16807 * square.x;
      } else if (square.x === 0) {
        geologicIndex = 48271 * square.y;
      } else {
        const leftNeighbor = cave.getOrCreateSquare(square.x - 1, square.y);
        const topNeighbor = cave.getOrCreateSquare(square.x, square.y - 1);
        geologicIndex = leftNeighbor.erosionLevel * topNeighbor.erosionLevel;
      }
      this.geologicIndexMap.set(key, geologicIndex);
    }
    return this.geologicIndexMap.get(key);
  }

  static isValidEquipment(type, equipment) {
    if (type === SQUARE_TYPE.ROCKY && (equipment === EQUIPMENT_TYPE.TORCH || equipment === EQUIPMENT_TYPE.CLIMBING_GEAR)) {
      return true;
    }
    if (type === SQUARE_TYPE.WET && (equipment === EQUIPMENT_TYPE.NEITHER || equipment === EQUIPMENT_TYPE.CLIMBING_GEAR)) {
      return true;
    }
    if (type === SQUARE_TYPE.NARROW && (equipment === EQUIPMENT_TYPE.NEITHER || equipment === EQUIPMENT_TYPE.TORCH)) {
      return true;
    }
    return false;
  }

  paint() {
    if (!canPaint) return;
    paint();
    for (let y = 0; y < maxY + 5; y++) {
      let caveLine = '';
      for (let x = minX; x < maxX + 5; x++) {
        let pixel = ' ';
        const key = Square.createKey(x, y);
        const position = this.squareMap.get(key);
        if (position) {
          pixel = position.type;
        }
        caveLine += pixel;
      }
      paint(caveLine);
    }

    paint('');
  }
}

class Node {
  constructor(time, equipment, square) {
    this.time = time;
    this.equipment = equipment;
    this.square = square;
  }

  get key() {
    return `${this.square.x}|${this.square.y}|${this.equipment}`;
  }
}

const trimFunc = i => i.trim();
const parseIntFunc = i => parseInt(i, 10);
const [depthString, targetString] = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc);
const depth = parseIntFunc(depthString.substring('depth: '.length));
const [targetX, targetY] = targetString.substring('target: '.length)
  .split(',')
  .map(trimFunc)
  .map(parseIntFunc);

debug(`depth: ${depth}`);
debug(`target: ${targetX}, ${targetY}`);

let extendedMaxX = targetX * 2;
let extendedMaxY = targetY * 2;

if (inputPath === 'input.txt') {
  extendedMaxX = 100;
}

cave = new Cave(depth);
const origin = cave.getOrCreateSquare(0, 0, SQUARE_TYPE.MOUTH);
const target = cave.getOrCreateSquare(targetX, targetY, SQUARE_TYPE.TARGET);

for (let i = 0; i <= extendedMaxX; i++) {
  for (let j = 0; j <= extendedMaxY; j++) {
    cave.getOrCreateSquare(i, j);
  }
}

cave.paint();

const validSquares = Array.from(cave.squareMap.values()).filter(s => s.x <= targetX && s.y <= targetY);

console.log(`part 01 answer: ${validSquares.reduce((p, c) => p + c.riskLevel, 0)}`);

const deltaX = [0, 1, 0, -1];
const deltaY = [-1, 0, 1, 0];
const startNode = new Node(0, EQUIPMENT_TYPE.TORCH, origin);
const queue = new TinyQueue([startNode], (a, b) => a.time - b.time);

const seen = new Map();
debug(`selected: ${queue.peek().square}, ${EQUIPMENT[queue.peek().equipment]}\n`);

while (queue.length !== 0) {
  const current = queue.pop();
  const currentSquare = current.square;
  const time = current.time;
  const x = currentSquare.x;
  const y = currentSquare.y;
  const tool = current.equipment;
  debug(`current node: ${currentSquare}, time: ${time}, tool: ${EQUIPMENT[tool]}, queue count: ${queue.length}, seen count: ${seen.size}`);
  if (x === targetX && y === targetY && tool === EQUIPMENT_TYPE.TORCH) {
    console.log(`part 02 answer: ${time}`);
    break;
  }

  if (seen.has(current.key)) {
    continue;
  }

  seen.set(current.key, current);

  for (let e of Object.values(EQUIPMENT_TYPE)) {
    if (Cave.isValidEquipment(cave.getSquare(x, y).type, e)) {
      queue.push(new Node(time + 7, e, currentSquare));
    }
  }

  for (let i = 0; i < 4; i++) {
    const dx = x + deltaX[i];
    const dy = y + deltaY[i];
    if (!(0 <= dx && dx < extendedMaxX && 0 <= dy && dy < extendedMaxY)) {
      continue;
    }
    const nextSquare = cave.getSquare(dx, dy);
    if (nextSquare && Cave.isValidEquipment(nextSquare.type, tool)) {
      queue.push(new Node(time + 1, tool, nextSquare));
    }
  }
  debug(`selected: ${queue.peek().square}, ${EQUIPMENT[queue.peek().equipment]}\n`);
}
