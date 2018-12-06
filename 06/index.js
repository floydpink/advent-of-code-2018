const fs = require('fs');

class Point {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }

  toString() {
    return `[ left: ${this.left}, top: ${this.top} ]`;
  }
}

let inputPath = 'input.txt';
const THRESHOLD = inputPath === 'input.txt' ? 10000 : 32;

const parseIntFunc = part => parseInt(part, 10);
const trimFunc = part => part.trim();
const destinations = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc)
  .map(a => {
    let [left, top] = a.split(',').map(trimFunc).map(parseIntFunc);
    return new Point(left, top);
  });

console.log(`destinations count: ${destinations.length}`);
// console.log(`destinations : ${destinations}`);

let leftMost = Number.MAX_SAFE_INTEGER;
let topMost = Number.MAX_SAFE_INTEGER;
let rightMost = Number.MIN_SAFE_INTEGER;
let bottomMost = Number.MIN_SAFE_INTEGER;
for (let destination of destinations) {
  leftMost = Math.min(leftMost, destination.left);
  topMost = Math.min(topMost, destination.top);
  rightMost = Math.max(rightMost, destination.left);
  bottomMost = Math.max(bottomMost, destination.top);
}

leftMost--;
topMost--;
rightMost++;
bottomMost++;

const areSamePoints = function (point1, point2) {
  return point1.left === point2.left && point1.top === point2.top;
};

const getManhattanDistance = function (point1, point2) {
  return Math.abs(point1.left - point2.left) + Math.abs(point1.top - point2.top);
};

const getUniqueClosestDestination = function (point) {
  // if point is one of the destinations, return it
  for (let destination of destinations) {
    if (areSamePoints(point, destination)) {
      return destination;
    }
  }

  let distanceMap = new Map();
  let minimumDistance = Number.MAX_SAFE_INTEGER;
  for (let destination of destinations) {
    let manhattanDistance = getManhattanDistance(point, destination);
    minimumDistance = Math.min(minimumDistance, manhattanDistance);
    if (minimumDistance === manhattanDistance) {
      if (!distanceMap.has(minimumDistance)) {
        distanceMap.set(minimumDistance, []);
      }
      distanceMap.get(minimumDistance).push(destination);
    }
  }

  let uniqueClosestDestination = null;
  if (distanceMap.get(minimumDistance).length === 1) {
    // this is uniquely the closest destination
    uniqueClosestDestination = distanceMap.get(minimumDistance)[0];
  }

  return uniqueClosestDestination;
};

const pointIsOnTheBorder = function (point) {
  return point.left === leftMost ||
    point.top === topMost ||
    point.left === rightMost ||
    point.top === bottomMost;
};

const getSumOfAllDistances = function (point) {
  let distances = [];
  for (let destination of destinations) {
    let manhattanDistance = getManhattanDistance(point, destination);
    distances.push(manhattanDistance);
  }

  return distances.reduce((p, c) => p + c);
};

const areaMap = new Map();
for (let destination of destinations) {
  areaMap.set(destination, 0);
}

let enclosedDestinations = new Set();
for (let destination of destinations) {
  enclosedDestinations.add(destination);
}

for (let l = leftMost; l <= rightMost; l++) {
  for (let t = topMost; t <= bottomMost; t++) {
    let point = new Point(l, t);
    let uniqueClosetDest = getUniqueClosestDestination(point);
    if (uniqueClosetDest) {
      areaMap.set(uniqueClosetDest, areaMap.get(uniqueClosetDest) + 1);
    }

    // remove any destination from being "enclosed", when it is closest to any border
    if (pointIsOnTheBorder(point) && enclosedDestinations.has(uniqueClosetDest)) {
      enclosedDestinations.delete(uniqueClosetDest);
    }
  }
}

let largestFiniteArea = Number.MIN_SAFE_INTEGER;
for (let destination of enclosedDestinations) {
  largestFiniteArea = Math.max(largestFiniteArea, areaMap.get(destination));
}

console.log(`part 01 answer: ${largestFiniteArea}`);

let safeRegionArea = 0;
for (let l = leftMost; l <= rightMost; l++) {
  for (let t = topMost; t <= bottomMost; t++) {
    let point = new Point(l, t);
    let sumOfAllDistances = getSumOfAllDistances(point);
    if (sumOfAllDistances < THRESHOLD) {
      safeRegionArea++;
    }
  }
}

console.log(`part 02 answer: ${safeRegionArea}`);
