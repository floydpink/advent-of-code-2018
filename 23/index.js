const fs = require('fs');

let inputPath = 'input.txt';

class Position {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toString() {
    return ` x: ${this.x} | y: ${this.y} | z: ${this.z} `;
  }

  manhattanDistanceTo(position) {
    return Math.abs(position.x - this.x) + Math.abs(position.y - this.y) + Math.abs(position.z - this.z);
  }
}

class Nanobot {
  constructor(position, signalRadius) {
    this.position = position;
    this.signalRadius = signalRadius;
  }

  toString() {
    return `${this.position}| r: ${this.signalRadius} `;
  }

  inRangeToHeuristic(bot) {
    const distance = this.position.manhattanDistanceTo(bot.position);
    return distance < (this.signalRadius + bot.signalRadius) * 0.7;
  }

  inRangeTo(position) {
    const distance = this.position.manhattanDistanceTo(position);
    return distance <= this.signalRadius;
  }

  get xAxisReachMin() {
    return this.position.x - this.signalRadius;
  }

  get yAxisReachMin() {
    return this.position.y - this.signalRadius;
  }

  get zAxisReachMin() {
    return this.position.z - this.signalRadius;
  }

  get xAxisReachMax() {
    return this.position.x + this.signalRadius;
  }

  get yAxisReachMax() {
    return this.position.y + this.signalRadius;
  }

  get zAxisReachMax() {
    return this.position.z + this.signalRadius;
  }

}

const trimFunc = s => s.trim();
const parseIntFunc = s => parseInt(s, 10);
// https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-88.php
const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
const nanobots = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(n => {
    let [p, r] = n.split(' ').map(trimFunc);
    let [x, y, z] = p.substring('pos=<'.length, p.length - 2).split(',').map(trimFunc).map(parseIntFunc);
    let signalRadius = parseIntFunc(r.substring('r='.length));
    return new Nanobot(new Position(x, y, z), signalRadius);
  });

// console.log(nanobots.length);
// console.log(nanobots);

let minX = Number.MAX_SAFE_INTEGER;
let minY = Number.MAX_SAFE_INTEGER;
let minZ = Number.MAX_SAFE_INTEGER;
let maxX = Number.MIN_SAFE_INTEGER;
let maxY = Number.MIN_SAFE_INTEGER;
let maxZ = Number.MIN_SAFE_INTEGER;

let minXWithRadius = Number.MAX_SAFE_INTEGER;
let minYWithRadius = Number.MAX_SAFE_INTEGER;
let minZWithRadius = Number.MAX_SAFE_INTEGER;
let maxXWithRadius = Number.MIN_SAFE_INTEGER;
let maxYWithRadius = Number.MIN_SAFE_INTEGER;
let maxZWithRadius = Number.MIN_SAFE_INTEGER;

let maximumRadius = Number.MIN_SAFE_INTEGER;
let strongestBot = null;
for (let bot of nanobots) {
  maximumRadius = Math.max(bot.signalRadius, maximumRadius);
  if (maximumRadius === bot.signalRadius) {
    strongestBot = bot;
  }

  // if (!bot.inRangeToHeuristic(medianBot)) {
  //   // console.log(`skipping ${bot}`);
  //   continue;
  // }

  minX = Math.min(bot.position.x, minX);
  minY = Math.min(bot.position.y, minY);
  minZ = Math.min(bot.position.z, minZ);
  maxX = Math.max(bot.position.x, maxX);
  maxY = Math.max(bot.position.y, maxY);
  maxZ = Math.max(bot.position.z, maxZ);

  minXWithRadius = Math.min(bot.position.x - bot.signalRadius, minXWithRadius);
  minYWithRadius = Math.min(bot.position.y - bot.signalRadius, minYWithRadius);
  minZWithRadius = Math.min(bot.position.z - bot.signalRadius, minZWithRadius);
  maxXWithRadius = Math.max(bot.position.x + bot.signalRadius, maxXWithRadius);
  maxYWithRadius = Math.max(bot.position.y + bot.signalRadius, maxYWithRadius);
  maxZWithRadius = Math.max(bot.position.z + bot.signalRadius, maxZWithRadius);
}

// console.log(strongestBot);

let inRangeBots = 0;
for (let bot of nanobots) {
  if (strongestBot.position.manhattanDistanceTo(bot.position) <= strongestBot.signalRadius) {
    inRangeBots++;
  }
}

// console.log();
console.log(`part 01 answer: ${inRangeBots}`);

process.exit(0);

// unsuccessful brute-force attempts at part 02 below

const origin = new Position(0, 0, 0);
const positionSpecs = new Map();
const getPositionSpec = function (position) {
  if (positionSpecs.has(position)) {
    return positionSpecs.get(position);
  }

  let inRangeBots = 0;
  for (let bot of nanobots) {
    if (position.manhattanDistanceTo(bot.position) <= bot.signalRadius) {
      inRangeBots++;
    }
  }
  const distanceToOrigin = origin.manhattanDistanceTo(position);
  const spec = {
    position,
    distanceToOrigin,
    inRangeBots
  };
  positionSpecs.set(position, spec);
  return spec;
};

const medianRadius = median(nanobots.map(n => n.signalRadius));
// console.log(`median signal radius: ${medianRadius}`);

const medianX = median(nanobots.map(n => n.position.x));
// console.log(`median x: ${medianX}`);
const medianY = median(nanobots.map(n => n.position.y));
// console.log(`median y: ${medianY}`);
const medianZ = median(nanobots.map(n => n.position.y));
// console.log(`median z: ${medianZ}`);
const medianXReach = median([].concat.apply([], nanobots.map(n => [n.xAxisReachMin, n.xAxisReachMax])));
// console.log(`median x reach: ${medianXReach}`);
const medianYReach = median([].concat.apply([], nanobots.map(n => [n.yAxisReachMin, n.yAxisReachMax])));
// console.log(`median y reach: ${medianYReach}`);
const medianZReach = median([].concat.apply([], nanobots.map(n => [n.zAxisReachMin, n.zAxisReachMax])));
// console.log(`median z reach: ${medianZReach}`);

const medianPosition = new Position(medianX, medianY, medianZ);
// console.log(`median position: ${medianPosition}`);

const medianBot = new Nanobot(medianPosition, medianRadius);
// console.log(medianBot);

const medianReachPosition = new Position(medianXReach, medianYReach, medianZReach);
// console.log(`median reach position: ${medianReachPosition}`);

const medianReachBot = new Nanobot(medianReachPosition, medianRadius);
// console.log(medianReachBot);

const xRange = (maxX - minX);
const yRange = (maxY - minY);
const zRange = (maxZ - minZ);

const xWithRadiusRange = (maxXWithRadius - minXWithRadius);
const yWithRadiusRange = (maxYWithRadius - minYWithRadius);
const zWithRadiusRange = (maxZWithRadius - minZWithRadius);

console.log();
console.log(`X: ${minX} - ${maxX} (${xRange})`);
console.log(`Y: ${minY} - ${maxY} (${yRange})`);
console.log(`Z: ${minZ} - ${maxZ} (${zRange})`);

console.log();
console.log(`X (wr): ${minXWithRadius} - ${maxXWithRadius} (${xWithRadiusRange})`);
console.log(`Y (wr): ${minYWithRadius} - ${maxYWithRadius} (${yWithRadiusRange})`);
console.log(`Z (wr): ${minZWithRadius} - ${maxZWithRadius} (${zWithRadiusRange})`);

const iMin = Math.floor(medianX - xRange / 10);
const iMax = Math.ceil(medianX + xRange / 10);
const jMin = Math.floor(medianY - yRange / 10);
const jMax = Math.ceil(medianY + yRange / 10);
const kMin = Math.floor(medianZ - zRange / 10);
const kMax = Math.ceil(medianZ + zRange / 10);

const iWithRadiusMin = Math.floor(medianXReach - xRange / 10);
const iWithRadiusMax = Math.ceil(medianXReach + xRange / 10);
const jWithRadiusMin = Math.floor(medianYReach - yRange / 10);
const jWithRadiusMax = Math.ceil(medianYReach + yRange / 10);
const kWithRadiusMin = Math.floor(medianZReach - zRange / 10);
const kWithRadiusMax = Math.ceil(medianZReach + zRange / 10);

console.log();
console.log(`i: ${iMin} - ${iMax} (${iMax - iMin})`);
console.log(`j: ${jMin} - ${jMax} (${kMax - kMin})`);
console.log(`k: ${kMin} - ${kMax} (${kMax - kMin})`);

console.log();
console.log(`i (wr): ${iWithRadiusMin} - ${iWithRadiusMax} (${iWithRadiusMax - iWithRadiusMin})`);
console.log(`j (wr): ${jWithRadiusMin} - ${jWithRadiusMax} (${kWithRadiusMax - kWithRadiusMin})`);
console.log(`k (wr): ${kWithRadiusMin} - ${kWithRadiusMax} (${kWithRadiusMax - kWithRadiusMin})`);

const getCubeCorners = function (x1, y1, z1, x2, y2, z2) {
  return [
    new Position(x1, y1, z1),
    new Position(x2, y1, z1),
    new Position(x2, y2, z1),
    new Position(x1, y2, z1),
    new Position(x1, y2, z2),
    new Position(x1, y1, z2),
    new Position(x2, y1, z2),
    new Position(x2, y2, z2)
  ];
};

/*const outerBoxCorners = getCubeCorners(iWithRadiusMin, jWithRadiusMin, kWithRadiusMin, iWithRadiusMax, jWithRadiusMax, kWithRadiusMax)
  .map(p => getPositionSpec(p));
console.log();
console.log(outerBoxCorners);

const innerBoxCorners = getCubeCorners(iMin, jMin, kMin, iMax, jMax, kMax)
  .map(p => getPositionSpec(p));
console.log();
console.log(innerBoxCorners);

const optimumBoxCorners01 = getCubeCorners(medianXReach, jMin, medianZReach, iMax, medianYReach, kMax)
  .map(p => getPositionSpec(p));
console.log();
console.log(optimumBoxCorners01);

const optimumBoxCorners02 = getCubeCorners(medianXReach, medianYReach, medianZReach, medianX, medianY, medianZ)
  .map(p => getPositionSpec(p));
console.log();
console.log(optimumBoxCorners02);*/




let counter = 0;
// let xLow = medianXReach;
// let xHigh = iWithRadiusMax;
// let yLow = medianYReach;
// let yHigh = jWithRadiusMax;
// let zLow = medianZReach;
// let zHigh = kWithRadiusMax;
// let xLow = iWithRadiusMin;
// let xHigh = iWithRadiusMax;
// let yLow = jWithRadiusMin;
// let yHigh = jWithRadiusMax;
// let zLow = kWithRadiusMin;
// let zHigh = kWithRadiusMax;
let xLow = medianX;
let xHigh = iMax;
let yLow = medianY;
let yHigh = jMax;
let zLow = medianZ;
let zHigh = kMax;
// let xLow = medianXReach;
// let xHigh = iWithRadiusMax;
// let yLow = medianYReach;
// let yHigh = jWithRadiusMax;
// let zLow = medianZReach;
// let zHigh = kWithRadiusMax;
// let xLow = medianX;
// let xHigh = medianXReach;
// let yLow = medianY;
// let yHigh = medianYReach;
// let zLow = medianZ;
// let zHigh = medianZReach;

let maxInRangeBots = Number.MIN_SAFE_INTEGER;
let distanceToOrigin = Number.MAX_SAFE_INTEGER;
while (counter < 1000000) {
  const corners = getCubeCorners(xLow, yLow, zLow, xHigh, yHigh, zHigh);
  const cornerSpecs = corners
    .map((p, id) => {
      return {
        id,
        spec : getPositionSpec(p)
      }
    })
    .sort((a, b) => b.spec.inRangeBots - a.spec.inRangeBots);

  let cornerWithMoreInRangeBots = cornerSpecs[0];

  maxInRangeBots = Math.max(maxInRangeBots, cornerWithMoreInRangeBots.spec.inRangeBots);

  if (cornerWithMoreInRangeBots.spec.inRangeBots === maxInRangeBots) {
    if (distanceToOrigin < cornerWithMoreInRangeBots.spec.distanceToOrigin) {
      distanceToOrigin = cornerWithMoreInRangeBots.spec.distanceToOrigin;
    }
    distanceToOrigin = Math.min(distanceToOrigin, cornerWithMoreInRangeBots.spec.distanceToOrigin)
  }

  xLow++;
  yLow++;
  zLow++;
  xHigh--;
  yHigh--;
  zHigh--;

  switch (cornerWithMoreInRangeBots.id) {
    case 0:
      // x1,y1,z1
      xHigh = Math.floor((xHigh - xLow) / 2);
      yHigh = Math.floor((yHigh - yLow) / 2);
      zHigh = Math.floor((zHigh - zLow) / 2);
      break;
    case 1:
      // x2,y1,z1
      xLow = Math.floor((xHigh - xLow) / 2);
      yHigh = Math.floor((yHigh - yLow) / 2);
      zHigh = Math.floor((zHigh - zLow) / 2);
      break;
    case 2:
      // x2,y2,z1
      xLow = Math.floor((xHigh - xLow) / 2);
      yLow = Math.floor((yHigh - yLow) / 2);
      zHigh = Math.floor((zHigh - zLow) / 2);
      break;
    case 3:
      // x1,y2,z1
      xHigh = Math.floor((xHigh - xLow) / 2);
      yLow = Math.floor((yHigh - yLow) / 2);
      zHigh = Math.floor((zHigh - zLow) / 2);
      break;
    case 4:
      // x1,y2,z2
      xHigh = Math.floor((xHigh - xLow) / 2);
      yLow = Math.floor((yHigh - yLow) / 2);
      zLow = Math.floor((zHigh - zLow) / 2);
      break;
    case 5:
      // x1,y1,z2
      xHigh = Math.floor((xHigh - xLow) / 2);
      yHigh = Math.floor((yHigh - yLow) / 2);
      xLow = Math.floor((zHigh - zLow) / 2);
      break;
    case 6:
      // x2,y1,z2
      xLow = Math.floor((xHigh - xLow) / 2);
      yHigh = Math.floor((yHigh - yLow) / 2);
      zLow = Math.floor((zHigh - zLow) / 2);
      break;
    case 7:
      // x2,y2,z2
      xLow = Math.floor((xHigh - xLow) / 2);
      xLow = Math.floor((yHigh - yLow) / 2);
      zLow = Math.floor((zHigh - zLow) / 2);
      break;
  }

  counter++;
}

// console.log(Array.from(positionSpecs.values()).sort((a, b) => b.inRangeBots - a.inRangeBots));
console.log(`maxInRangeBots: ${maxInRangeBots} | distanceToOrigin: ${distanceToOrigin}`);