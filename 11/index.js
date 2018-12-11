// const specifiedSerialNumber = 18;
// const specifiedSerialNumber = 42;
const specifiedSerialNumber = 9221;

const calculatePowerLevel = function (i, j, serialNumber = null) {
  serialNumber = serialNumber || specifiedSerialNumber;
  const rackId = i + 10;
  const intermediateResult = (rackId * j + serialNumber) * rackId;
  let result = Math.floor(intermediateResult / 100);
  if (result > 0) {
    result = result % 10;
  }
  return result - 5;
};

/* examples
console.log(calculatePowerLevel(3, 5, 8));
console.log(calculatePowerLevel(122, 79, 57));
console.log(calculatePowerLevel(217, 196, 39));
console.log(calculatePowerLevel(101, 153, 71));
*/

const grid = [];
for (let i = 1; i <= 300; i++) {
  const row = [];
  grid[i] = row;
  for (let j = 1; j <= 300; j++) {
    row[j] = calculatePowerLevel(i, j)
  }
}

class Pair {
  constructor(i, j, size) {
    this.i = i;
    this.j = j;
    this.size = size;
  }
}

// part 01

let threeByThreeSquareMap = new Map();

const calculateAndStoreSquare = function (i, j, squareSize = 3) {
  let size = squareSize - 1;
  if (i > 1 && (i + size) < 300 && j > 1 && (j + size) < 300) {
    let sum = 0;
    for (let x = i; x <= (i + size); x++) {
      for (let y = j; y <= (j + size); y++) {
        sum += grid[x][y];
      }
    }
    threeByThreeSquareMap.set(new Pair(i, j, squareSize), sum);
  }
};

for (let i = 1; i <= 300; i++) {
  for (let j = 1; j <= 300; j++) {
    calculateAndStoreSquare(i, j);
  }
}

let maxPowerLevel = Number.MIN_SAFE_INTEGER;
let part01Answer = null;
for (let entry of threeByThreeSquareMap.entries()) {
  maxPowerLevel = Math.max(entry[1], maxPowerLevel);
  if (maxPowerLevel === entry[1]) {
    part01Answer = entry[0];
  }
}

// console.log(threeByThreeSquareMap.size);
// console.log(threeByThreeSquareMap.get(part01Answer));
console.log(`part 01 answer: ${part01Answer.i}, ${part01Answer.j}`);

// part 02

threeByThreeSquareMap = new Map();

for (let i = 1; i <= 300; i++) {
  for (let j = 1; j <= 300; j++) {
    for (let k = 1; k < 18; k++) {
      calculateAndStoreSquare(i, j, k);
    }
  }
}

maxPowerLevel = Number.MIN_SAFE_INTEGER;
let part02Answer = null;
for (let entry of threeByThreeSquareMap.entries()) {
  maxPowerLevel = Math.max(entry[1], maxPowerLevel);
  if (maxPowerLevel === entry[1]) {
    part02Answer = entry[0];
  }
}

// console.log(threeByThreeSquareMap.size);
// console.log(threeByThreeSquareMap.get(part02Answer));
console.log(`part 01 answer: ${part02Answer.i}, ${part02Answer.j}, ${part02Answer.size}`);
