const fs = require('fs');

let inputPath = 'input.txt';
const MAX_SECONDS = inputPath === 'input.txt' ? 11000 : 5;

class Position {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }
}

class Velocity {
  constructor(left, top) {
    this.leftChange = left;
    this.topChange = top;
  }
}

class Star {
  constructor(position, velocity) {
    this.left = position.left;
    this.top = position.top;
    this.leftChange = velocity.leftChange;
    this.topChange = velocity.topChange;
  }

  elapseSecond() {
    this.left += this.leftChange;
    this.top += this.topChange;
  }
}

class Sky {
  constructor(stars) {
    this.stars = stars;
  }

  toString() {
    return `[${this.height}, ${this.width} - ${this.area}]`;
  }

  get leftMost() {
    let leftMost = Number.MAX_SAFE_INTEGER;
    for (let star of this.stars) {
      leftMost = Math.min(leftMost, star.left);
    }
    return leftMost - 1;
  }

  get rightMost() {
    let rightMost = Number.MIN_SAFE_INTEGER;
    for (let star of this.stars) {
      rightMost = Math.max(rightMost, star.left);
    }
    return rightMost + 1;
  }

  get topMost() {
    let topMost = Number.MAX_SAFE_INTEGER;
    for (let star of this.stars) {
      topMost = Math.min(topMost, star.top);
    }
    return topMost - 1;
  }

  get bottomMost() {
    let bottomMost = Number.MIN_SAFE_INTEGER;
    for (let star of this.stars) {
      bottomMost = Math.max(bottomMost, star.top);
    }
    return bottomMost + 1;
  }

  get width() {
    return this.rightMost - this.leftMost;
  }

  get height() {
    return this.bottomMost - this.topMost;
  }

  get area() {
    return this.width * this.height;
  }

  paint(second) {
    if (this.height < 100) {
      console.log(`${second}th second`);
      for (let top = this.topMost; top <= this.bottomMost; top++) {
        let skyline = '';
        for (let left = this.leftMost; left <= this.rightMost; left++) {
          let pixel = '.';
          for (let star of stars) {
            if (star.left === left && star.top === top) {
              pixel = '#';
              break;
            }
          }
          skyline += pixel;
        }
        console.log(skyline);
      }

      console.log('');
    }
  }

  elapseSecond(second) {
    for (let star of this.stars) {
      star.elapseSecond();
    }

    this.paint(second);
  }
}

const parseIntFunc = part => parseInt(part, 10);
const trimFunc = part => part.trim();
const parsePair = (pairString, isVelocity = false) => {
  pairString = pairString.replace(/[<>]/g, '');
  const [left, top] = pairString.split(',').map(trimFunc).map(parseIntFunc);
  return isVelocity ? new Velocity(left, top) : new Position(left, top);
};

const stars = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc)
  .map(line => {
    const [positionString, velocityPair] = line.split('velocity=').map(trimFunc);
    const positionPair = [positionString.substring('position='.length)].map(trimFunc)[0];
    const position = parsePair(positionPair);
    const velocity = parsePair(velocityPair, true);
    return new Star(position, velocity);
  });

console.log(`stars count: ${stars.length}`);

const sky = new Sky(stars);
sky.paint(0);

for (let second = 1; second < MAX_SECONDS; second++) {
  sky.elapseSecond(second);
}