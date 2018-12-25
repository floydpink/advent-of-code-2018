const fs = require('fs');

let inputPath = 'input.txt';
let canPaint = false;
let paintOnlyBoxes = false;
const debug = (...message) => {
  // enable this to debug
  if (false) console.log(...message);
};
const paint = (...message) => {
  // enable this to visualize
  if (canPaint) console.log(...message);
};


let ground;
let minX = Number.MAX_SAFE_INTEGER;
let maxX = Number.MIN_SAFE_INTEGER;
let minY = Number.MAX_SAFE_INTEGER;
let maxY = Number.MIN_SAFE_INTEGER;

let positionId = 0;
let veinId = 0;

const SQUARE_TYPE = {
  SAND     : 0,
  CLAY     : 1,
  WET_SAND : 2,
  WATER    : 3,
  SPRING   : 4
};

class Square {
  constructor(x, y, vein = null) {
    this.id = positionId++;
    this.y = y;
    this.x = x;
    if (vein) {
      this.veins = [vein];
      this.fill(SQUARE_TYPE.CLAY);
    } else {
      this.veins = [];
      this.fill(SQUARE_TYPE.SAND);
    }
  }

  toString() {
    return `(${this.x},${this.y})`;
  }

  get key() {
    return Square.createKey(this.x, this.y);
  }

  get isValid() {
    return this.y >= minY && this.y <= maxY;
  }

  get pixel() {
    if (this.type === SQUARE_TYPE.SAND) {
      return '.';
    }
    if (this.type === SQUARE_TYPE.CLAY) {
      return '#';
    }
    if (this.type === SQUARE_TYPE.WET_SAND) {
      return '|';
    }
    if (this.type === SQUARE_TYPE.WATER) {
      return '~';
    }
    if (this.type === SQUARE_TYPE.SPRING) {
      return '+';
    }
  }

  static createKey(x, y) {
    return `${x}|${y}`;
  }

  get isEmpty() {
    return this.type === SQUARE_TYPE.SAND;
  }

  get isClay() {
    return this.type === SQUARE_TYPE.CLAY;
  }

  get isWater() {
    return this.type === SQUARE_TYPE.WATER;
  }

  get isBlocked() {
    return this.isClay || this.isWater;
  }

  get isWet() {
    return this.type === SQUARE_TYPE.WET_SAND;
  }

  get hasWallOnLeft() {
    let neighbor = this.leftNeighbor;
    while (neighbor) {
      if (neighbor.isEmpty) return false;
      if (neighbor.isClay) return true;
      neighbor = neighbor.leftNeighbor;
    }
    return false;
  }

  fill(type) {
    this.type = type;
  }

  fillLeft() {
    let neighbor = this.leftNeighbor;
    while (neighbor) {
      if (neighbor.isClay) return;
      neighbor.fill(SQUARE_TYPE.WATER);
      neighbor = neighbor.leftNeighbor;
    }
  }

  get hasWallOnRight() {
    let neighbor = this.rightNeighbor;
    while (neighbor) {
      if (neighbor.isEmpty) return false;
      if (neighbor.isClay) return true;
      neighbor = neighbor.rightNeighbor;
    }
    return false;
  }

  fillRight() {
    let neighbor = this.rightNeighbor;
    while (neighbor) {
      if (neighbor.isClay) return;
      neighbor.fill(SQUARE_TYPE.WATER);
      neighbor = neighbor.rightNeighbor;
    }
  }

  get onlyVein() {
    return this.veins.length === 1 ? this.veins[0] : null;
  }

  get hasIntersection() {
    return this.veins.length > 1;
  }

  get topNeighbor() {
    return ground.getSquare(this.x, this.y - 1) || new Square(this.x, this.y - 1);
  }

  get rightNeighbor() {
    return ground.getSquare(this.x + 1, this.y) || new Square(this.x + 1, this.y);
  }

  get bottomNeighbor() {
    return ground.getSquare(this.x, this.y + 1) || new Square(this.x, this.y + 1);
  }

  get leftNeighbor() {
    return ground.getSquare(this.x - 1, this.y) || new Square(this.x - 1, this.y);
  }

  get neighbors() {
    return [this.topNeighbor, this.rightNeighbor, this.bottomNeighbor, this.leftNeighbor]
      .filter(n => !!n);
  }
}

const springPosition = new Square(500, 0);
springPosition.fill(SQUARE_TYPE.SPRING);

class Ground {
  constructor() {
    this.clayVeinMap = new Map();
    this.clayPositionMap = new Map();
    this.sandPositionMap = new Map();
  }

  getOrCreateClayPosition(vein, at, point, isVertical) {
    const x = isVertical ? at : point;
    const y = isVertical ? point : at;
    const key = Square.createKey(x, y);

    if (this.clayPositionMap.has(key)) {
      // intersection - make the links
      const clayPosition = this.clayPositionMap.get(key);

      let existingVein = clayPosition.veins[0];
      vein.touchingVeins.push(existingVein);
      existingVein.touchingVeins.push(vein);

      vein.touchPoints.push(clayPosition);
      existingVein.touchPoints.push(clayPosition);

      clayPosition.veins.push(vein);

      return clayPosition;
    }

    const clayPosition = new Square(x, y, vein);
    this.clayPositionMap.set(key, clayPosition);
    return clayPosition;
  }

  addClayVein(vein) {
    this.clayVeinMap.set(vein.key, vein);
  }

  getSquare(x, y) {
    const key = Square.createKey(x, y);
    if (this.clayPositionMap.has(key) || this.sandPositionMap.has(key)) {
      return this.clayPositionMap.get(key) || this.sandPositionMap.get(key);
    }

    return undefined;
  }

  paint(force) {
    if (!canPaint && !force) return;
    paint();
    for (let y = 0; y < maxY + 5; y++) {
      let groundLine = '';
      for (let x = minX - 3; x < maxX + 3; x++) {
        let pixel = ' ';
        if (x === springPosition.x && y === springPosition.y) { // water spring
          pixel = springPosition.pixel;
        } else {
          const key = Square.createKey(x, y);
          const position = this.getSquare(x, y);
          if (position) {
            pixel = position.pixel;
            if (paintOnlyBoxes && position.type === SQUARE_TYPE.CLAY) {
              if (!(position.onlyVein && position.onlyVein.isABox)) {
                pixel = ' ';
              }
            }
          } else {
            const sandSquare = new Square(x, y);
            this.sandPositionMap.set(key, sandSquare);
            pixel = sandSquare.isValid ? sandSquare.pixel : ' ';
          }
        }
        groundLine += pixel;
      }
      paint(groundLine);
    }

    paint('');
  }
}

ground = new Ground();

class ClayVein {
  constructor(at, points, isVertical) {
    this.id = veinId++;
    this.at = at;
    this.points = points;
    this.isVertical = isVertical;
    this._positions = [];
    this.touchingVeins = [];
    this.touchPoints = [];

    this.generatePositions();
  }

  get endPoint1() {
    return this.points[0];
  }

  get endPoint2() {
    return this.points[this.points.length - 1];
  }

  get isABox() {
    return this.touchingVeins.length === 2 &&
      this.touchingVeins.every(x => x.touchingVeins.length === 2);
  }

  get key() {
    return `${this.isVertical ? 'x=' : 'y='}${this.at}, ${this.isVertical ? 'y=' : 'x='}${this.endPoint1}..${this.endPoint2}`;
  }

  generatePositions() {
    for (let point of this.points) {
      const position = ground.getOrCreateClayPosition(this, this.at, point, this.isVertical);

      this._positions.push(position);

      minX = Math.min(minX, position.x);
      maxX = Math.max(maxX, position.x);
      minY = Math.min(minY, position.y);
      maxY = Math.max(maxY, position.y);
    }
  }

  get positions() {
    return this._positions;
  }
}

const trimFunc = i => i.trim();
const parseIntFunc = i => parseInt(i, 10);
const parseVeins = function (line) {
  const lineParts = line.split(', ').map(trimFunc);
  const [leftPart, rightPart] = lineParts;

  const at = parseIntFunc(leftPart.substring(2));
  const [start, end] = rightPart.substring(2).split('..').map(parseIntFunc);
  const points = Array.from(Array(1 + end - start).keys()).map(i => i + start);

  const vein = new ClayVein(at, points, leftPart.startsWith('x='));
  ground.addClayVein(vein);

  if (line !== vein.key) {
    throw new Error(`key doesn't match literal!`);
  }

  return vein;
};

const veins = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(parseVeins);

ground.paint(true);

const clayPositions = Array.from(ground.clayPositionMap.values());
const sandPositions = Array.from(ground.sandPositionMap.values());

debug(`veins count: ${veins.length}`);
debug(`vertical veins count: ${veins.filter(v => v.isVertical).length}`);
debug(`horizontal veins count: ${veins.filter(v => !v.isVertical).length}`);

debug(`minX: ${minX}`);
debug(`maxX: ${maxX}`);
debug(`minY: ${minY}`);
debug(`maxY: ${maxY}`);

debug(`sand positions: ${sandPositions.length}`);
debug(`invalid sand positions: ${sandPositions.filter(p => !p.isValid).length}`);
debug(`clay positions: ${clayPositions.length}`);
debug(`clayVein positions: ${[].concat.apply([], veins.map(v => v.positions)).length}`);
debug(`intersection positions: ${clayPositions.filter(p => p.hasIntersection).length}`);
debug(`positions with more than two veins: ${clayPositions.filter(p => p.veins.length > 2).length}`);

debug(`invalid positions: ${clayPositions.filter(p => p.veins.length > 2).length}`);

debug(`veins with touching veins: ${veins.filter(p => p.touchingVeins.length > 0).length}`);
debug(`veins with more than 1 touching veins: ${veins.filter(p => p.touchingVeins.length > 1).length}`);
debug(`veins with more than 2 touching veins: ${veins.filter(p => p.touchingVeins.length > 2).length}`);

debug(`veins with touchPoints: ${veins.filter(p => p.touchPoints.length > 0).length}`);
debug(`veins with more than 1 touchPoints: ${veins.filter(p => p.touchPoints.length > 1).length}`);
debug(`veins with more than 2 touchPoints: ${veins.filter(p => p.touchPoints.length > 2).length}`);

debug(`veins that are boxes: ${veins.filter(p => p.isABox).length}`);

let counter = 0;

const flowWater = function(square) {
  counter++;
  if (square.y >= maxY /*|| counter > 10*/) return;

  if (square.bottomNeighbor.isEmpty) {
    if (square.bottomNeighbor.y >= minY) {
      square.bottomNeighbor.fill(SQUARE_TYPE.WET_SAND);
    }
    flowWater(square.bottomNeighbor);
  }

  if (square.bottomNeighbor.isBlocked && square.leftNeighbor.isEmpty) {
    square.leftNeighbor.fill(SQUARE_TYPE.WET_SAND);
    flowWater(square.leftNeighbor);
  }

  if (square.bottomNeighbor.isBlocked && square.rightNeighbor.isEmpty) {
    square.rightNeighbor.fill(SQUARE_TYPE.WET_SAND);
    flowWater(square.rightNeighbor);
  }

  if (square.bottomNeighbor.isBlocked && square.hasWallOnLeft && square.hasWallOnRight) {
    square.fillLeft();
    square.fillRight();
    square.fill(SQUARE_TYPE.WATER);
  }

  //ground.paint()
};

flowWater(springPosition);

ground.paint();

console.log(`part 01 answer: ${Array.from(ground.sandPositionMap.values()).filter(s => s.isWet || s.isWater).length}`);
console.log(`part 01 answer: ${Array.from(ground.sandPositionMap.values()).filter(s => s.isWater).length}`);