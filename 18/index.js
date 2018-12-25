const fs = require('fs');

let inputPath = 'input.txt';
let canPaint = false;
const debug = (...message) => {
  // enable this to debug
  if (false) console.log(...message);
};
const paint = (...message) => {
  // enable this to visualize
  if (canPaint) console.log(...message);
};

let acreId = 0;
const ACRE_TYPE = {
  OPEN_GROUND : '.',
  TREES       : '|',
  LUMBERYARD  : '#'
};

const ACRE = {
  '.' : ACRE_TYPE.OPEN_GROUND,
  '|' : ACRE_TYPE.TREES,
  '#' : ACRE_TYPE.LUMBERYARD
};

let area;

class Acre {
  constructor(x, y, type) {
    this.id = acreId++;
    this.x = x;
    this.y = y;
    this.type = type;
  }

  toString() {
    return `(${this.x},${this.y})`;
  }

  prepareTransition() {
    if (this.type === ACRE_TYPE.OPEN_GROUND &&
      this.neighbors.filter(a => a.type === ACRE_TYPE.TREES).length >= 3) {
      area.transitions.set(this.key, ACRE_TYPE.TREES);
    }

    if (this.type === ACRE_TYPE.TREES &&
      this.neighbors.filter(a => a.type === ACRE_TYPE.LUMBERYARD).length >= 3) {
      area.transitions.set(this.key, ACRE_TYPE.LUMBERYARD);
    }

    if (this.type === ACRE_TYPE.LUMBERYARD) {
      if (this.neighbors.filter(a => a.type === ACRE_TYPE.LUMBERYARD).length >= 1 &&
            this.neighbors.filter(a => a.type === ACRE_TYPE.TREES).length >= 1) {
        area.transitions.set(this.key, ACRE_TYPE.LUMBERYARD);
      } else {
        area.transitions.set(this.key, ACRE_TYPE.OPEN_GROUND);
      }
    }
  }

  get key() {
    return Acre.createKey(this.x, this.y);
  }

  static createKey(x, y) {
    return `${x}|${y}`;
  }

  get topNeighbor() {
    return area.getSquare(this.x, this.y - 1);
  }

  get topRightNeighbor() {
    return area.getSquare(this.x + 1, this.y - 1);
  }

  get rightNeighbor() {
    return area.getSquare(this.x + 1, this.y);
  }

  get bottomRightNeighbor() {
    return area.getSquare(this.x + 1, this.y + 1);
  }

  get bottomNeighbor() {
    return area.getSquare(this.x, this.y + 1);
  }

  get bottomLeftNeighbor() {
    return area.getSquare(this.x - 1, this.y + 1);
  }

  get leftNeighbor() {
    return area.getSquare(this.x - 1, this.y);
  }

  get topLeftNeighbor() {
    return area.getSquare(this.x - 1, this.y - 1);
  }

  get neighbors() {
    return [
      this.topNeighbor,
      this.topRightNeighbor,
      this.rightNeighbor,
      this.bottomRightNeighbor,
      this.bottomNeighbor,
      this.bottomLeftNeighbor,
      this.leftNeighbor,
      this.topLeftNeighbor
    ].filter(n => !!n);
  }
}

class Area {
  constructor() {
    this.acreMap = new Map();
    this.transitions = new Map();
    this.minX = Number.MAX_SAFE_INTEGER;
    this.minY = Number.MAX_SAFE_INTEGER;
    this.maxX = Number.MIN_SAFE_INTEGER;
    this.maxY = Number.MIN_SAFE_INTEGER;
  }

  getOrCreateAcre(x, y, type) {
    const key = Acre.createKey(x, y);
    if (!this.acreMap.has(key)) {
      const acre = new Acre(x, y, type);
      this.acreMap.set(key, acre);
      this.minX = Math.min(this.minX, x);
      this.maxX = Math.max(this.maxX, x);
      this.minY = Math.min(this.minY, y);
      this.maxY = Math.max(this.maxY, y);
    }
    return this.acreMap.get(key);
  }

  getSquare(x, y) {
    const key = Acre.createKey(x, y);
    return this.acreMap.get(key);
  }

  applyTransitions() {
    for (let [key, type] of this.transitions.entries()) {
      const acre = this.acreMap.get(key);
      acre.type = type;
    }
  }

  paint(second) {
    if (!canPaint) return;
    paint();
    paint(`Second #${second}`);
    for (let y = this.minY; y <= this.maxY; y++) {
      let areaLine = '';
      for (let x = this.minX; x <= this.maxX; x++) {
        let pixel = ' ';
        const key = Acre.createKey(x, y);
        const position = this.acreMap.get(key);
        if (position) {
          pixel = position.type;
        }
        areaLine += pixel;
      }
      paint(areaLine);
    }

    paint('');
  }
}

area = new Area();
const collectionArea = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map((line, y) => {
    return line.split('').map((cell, x) => {
      return area.getOrCreateAcre(x, y, ACRE[cell]);
    })
  });

/*
// debug(`collectionArea rows count: ${collectionArea.length}`);

const acres = [].concat.apply([], collectionArea);
debug(`acres count: ${acres.length}`);
// debug(`acres:`);
// debug(acres);*/

let second = 0;
area.paint(second);

for (let second = 1; second <= 524; second++) {
  area.transitions = new Map();
  for (let acre of area.acreMap.values()) {
    acre.prepareTransition();
  }
  area.applyTransitions();
  area.paint(second);

  const acres = Array.from(area.acreMap.values());
  const woodedAcres = acres.filter(a => a.type === ACRE_TYPE.TREES).length;
  const lumberYards = acres.filter(a => a.type === ACRE_TYPE.LUMBERYARD).length;
  if (second === 10) {
    debug(`After ${second} seconds...`);
    debug(`wooded acres: ${woodedAcres}`);
    debug(`lumberyards: ${lumberYards}`);
    debug();
    const part01Answer = woodedAcres * lumberYards;
    console.log(`part 01 answer: ${part01Answer}`);
  }
}

const acres = Array.from(area.acreMap.values());
const woodedAcres = acres.filter(a => a.type === ACRE_TYPE.TREES).length;
const lumberYards = acres.filter(a => a.type === ACRE_TYPE.LUMBERYARD).length;
debug(`wooded acres: ${woodedAcres}`);
debug(`lumberyards: ${lumberYards}`);
const part02Answer = woodedAcres * lumberYards;
console.log(`part 02 answer: ${part02Answer}`);