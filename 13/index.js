const fs = require('fs');

const inputPath = 'input.txt';
const runningPart01 = false;

const PATH = {
  UNKNOWN      : '',
  HORIZONTAL   : '-',
  VERTICAL     : '|',
  SLANT_RIGHT  : '/',
  SLANT_LEFT   : '\\',
  INTERSECTION : '+',
};

const PATHS = {
  ['']   : PATH.UNKNOWN,
  ['-']  : PATH.HORIZONTAL,
  ['|']  : PATH.VERTICAL,
  ['/']  : PATH.SLANT_RIGHT,
  ['\\'] : PATH.SLANT_LEFT,
  ['+']  : PATH.INTERSECTION
};

const DIRECTION = {
  UP    : '^',
  DOWN  : 'v',
  RIGHT : '>',
  LEFT  : '<'
};

const DIRECTIONS = {
  ['^'] : DIRECTION.UP,
  ['v'] : DIRECTION.DOWN,
  ['>'] : DIRECTION.RIGHT,
  ['<'] : DIRECTION.LEFT
};

const TURN = {
  LEFT     : 'left',
  STRAIGHT : 'straight',
  RIGHT    : 'right'
};

class Track {
  constructor() {
    this.positionMap = new Map();
    this.trackNodeMap = new Map();
    this.cartMap = new Map();
    this.tick = 0;
    this.foundCrash = false;
    this.cartId = 0;
  }

  getOrCreatePosition(left, top) {
    const positionKey = `${top}|${left}`;
    if (!this.positionMap.has(positionKey)) {
      this.positionMap.set(positionKey, new Position(left, top));
    }
    return this.positionMap.get(positionKey);
  }

  getOrCreateTrackNode(position, content) {
    if (!this.trackNodeMap.has(position)) {
      this.trackNodeMap.set(position, new TrackNode(position, content));
    }
    return this.trackNodeMap.get(position);
  }

  getOrCreateCart(position, content) {
    if (!this.cartMap.has(position)) {
      this.cartMap.set(position, new Cart(++this.cartId, position, content));
    }
    return this.cartMap.get(position);
  }

  get cartsInOrder() {
    const carts = Array.from(this.cartMap.values());
    return carts
      .filter(c => c.tick === this.tick)
      .sort((a, b) => {
        if (a.position.top === b.position.top) {
          return a.position.left - b.position.left;
        }
        return a.position.top - b.position.top;
      })
  }

  get leftMost() {
    let leftMost = Number.MAX_SAFE_INTEGER;
    for (let position of this.positionMap.values()) {
      leftMost = Math.min(leftMost, position.left);
    }
    return leftMost - 1;
  }

  get rightMost() {
    let rightMost = Number.MIN_SAFE_INTEGER;
    for (let position of this.positionMap.values()) {
      rightMost = Math.max(rightMost, position.left);
    }
    return rightMost + 1;
  }

  get topMost() {
    let topMost = Number.MAX_SAFE_INTEGER;
    for (let position of this.positionMap.values()) {
      topMost = Math.min(topMost, position.top);
    }
    return topMost - 1;
  }

  get bottomMost() {
    let bottomMost = Number.MIN_SAFE_INTEGER;
    for (let position of this.positionMap.values()) {
      bottomMost = Math.max(bottomMost, position.top);
    }
    return bottomMost + 1;
  }

  get width() {
    return this.rightMost - this.leftMost;
  }

  get height() {
    return this.bottomMost - this.topMost;
  }

  paint() {
    if (this.height < 100) {
      console.log(`tick # ${this.tick}`);
      for (let top = this.topMost; top <= this.bottomMost; top++) {
        let skyline = '';
        for (let left = this.leftMost; left <= this.rightMost; left++) {
          let pixel = ' ';
          for (let node of this.trackNodeMap.values()) {
            if (node.position.left === left && node.position.top === top) {
              pixel = node.path;
              break;
            }
          }
          for (let cart of this.cartsInOrder) {
            if (cart.position.left === left && cart.position.top === top) {
              pixel = cart.direction;
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
}

const track = new Track();

class Position {
  constructor(left, top) {
    this.left = left;
    this.top = top;
  }

  toString() {
    return `(${this.left}, ${this.top})`;
  }

  get leftNeighbor() {
    return track.getOrCreatePosition(this.left - 1, this.top);
  }

  get rightNeighbor() {
    return track.getOrCreatePosition(this.left + 1, this.top);
  }

  get topNeighbor() {
    return track.getOrCreatePosition(this.left, this.top - 1);
  }

  get bottomNeighbor() {
    return track.getOrCreatePosition(this.left, this.top + 1);
  }
}

class TrackNode {
  constructor(position, content) {
    this.position = position;
    this.path = PATHS[content];
    if (!!DIRECTIONS[content] && !this.path) { // has cart
      this.cart = track.getOrCreateCart(position, content);
      this.path = PATH.UNKNOWN;
    }
    this.neighbors = new Map();
  }

  addNeighbor(neighbor) {
    this.neighbors.set(neighbor.position, neighbor);
  }

  toString() {
    return `[N:${this.position}:'${this.path}'${!!this.cart ? '*' : ''}]`;
  }

  get leftNeighbor() {
    return this.neighbors.get(this.position.leftNeighbor);
  }

  get rightNeighbor() {
    return this.neighbors.get(this.position.rightNeighbor);
  }

  get topNeighbor() {
    return this.neighbors.get(this.position.topNeighbor);
  }

  get bottomNeighbor() {
    return this.neighbors.get(this.position.bottomNeighbor);
  }

  nextNode(direction) {
    switch (this.path) {
      case PATH.HORIZONTAL:
        if (direction !== DIRECTION.RIGHT && direction !== DIRECTION.LEFT) {
          throw new Error('Invalid direction.')
        }
        return direction === DIRECTION.RIGHT ? this.rightNeighbor : this.leftNeighbor;
      case PATH.VERTICAL:
        if (direction !== DIRECTION.UP && direction !== DIRECTION.DOWN) {
          throw new Error('Invalid direction.')
        }
        return direction === DIRECTION.UP ? this.topNeighbor : this.bottomNeighbor;
      case PATH.SLANT_RIGHT:
      case PATH.SLANT_LEFT:
      case PATH.INTERSECTION:
        switch (direction) {
          case DIRECTION.UP:
            return this.topNeighbor;
          case DIRECTION.RIGHT:
            return this.rightNeighbor;
          case DIRECTION.DOWN:
            return this.bottomNeighbor;
          case DIRECTION.LEFT:
            return this.leftNeighbor;
          default:
            throw new Error('Invalid direction.')
        }
    }
  }
}

class Cart {
  constructor(id, position, direction) {
    this.id = id;
    this.position = position;
    this.direction = DIRECTIONS[direction];
    this.positions = [];
    this.lastTurn = null;
    this.tick = 0;
  }

  toString() {
    return `[C: ${this.position}: ${this.direction}]`;
  }

  nextTurn() {
    if (!this.lastTurn || this.lastTurn === TURN.RIGHT) {
      this.lastTurn = TURN.LEFT;
    } else if (this.lastTurn === TURN.LEFT) {
      this.lastTurn = TURN.STRAIGHT;
    } else if (this.lastTurn === TURN.STRAIGHT) {
      this.lastTurn = TURN.RIGHT;
    }
    return this.lastTurn;
  }

  move() {
    const trackNode = track.getOrCreateTrackNode(this.position);
    const nextNode = trackNode.nextNode(this.direction);
    if (!!nextNode) {
      switch (nextNode.path) {
        case PATH.INTERSECTION:
          const turn = this.nextTurn();
          if (turn !== TURN.STRAIGHT) {
            if (this.direction === DIRECTION.UP) {
              this.direction = turn === TURN.LEFT ? DIRECTION.LEFT : DIRECTION.RIGHT;
            } else if (this.direction === DIRECTION.RIGHT) {
              this.direction = turn === TURN.LEFT ? DIRECTION.UP : DIRECTION.DOWN;
            } else if (this.direction === DIRECTION.DOWN) {
              this.direction = turn === TURN.LEFT ? DIRECTION.RIGHT : DIRECTION.LEFT;
            } else if (this.direction === DIRECTION.LEFT) {
              this.direction = turn === TURN.LEFT ? DIRECTION.DOWN : DIRECTION.UP;
            }
          }
          break;
        case PATH.SLANT_RIGHT:
          if (this.direction === DIRECTION.UP) {
            this.direction = DIRECTION.RIGHT;
          } else if (this.direction === DIRECTION.RIGHT) {
            this.direction = DIRECTION.UP;
          } else if (this.direction === DIRECTION.DOWN) {
            this.direction = DIRECTION.LEFT;
          } else if (this.direction === DIRECTION.LEFT) {
            this.direction = DIRECTION.DOWN;
          }
          break;
        case PATH.SLANT_LEFT:
          if (this.direction === DIRECTION.UP) {
            this.direction = DIRECTION.LEFT;
          } else if (this.direction === DIRECTION.RIGHT) {
            this.direction = DIRECTION.DOWN;
          } else if (this.direction === DIRECTION.DOWN) {
            this.direction = DIRECTION.RIGHT;
          } else if (this.direction === DIRECTION.LEFT) {
            this.direction = DIRECTION.UP;
          }
          break;
      }
      this.positions.push(this.position);
      this.position = nextNode.position;
      trackNode.cart = null;
      if (nextNode.cart != null && runningPart01) {
        // !!! CRASH
        nextNode.cart = this;
        console.log(`FOUND CRASH AT: ${nextNode.position}`);
        this.direction = 'X';
        track.foundCrash = true;
      } else if (nextNode.cart != null && !runningPart01) {
        console.log(`CRASH AT: ${nextNode.position} - carts removed: ${nextNode.cart.id} & ${this.id}`);
        nextNode.cart.tick = -1;
        this.tick = -1;
        nextNode.cart = null;
      }
      if (runningPart01) {
        nextNode.cart = this;
        this.tick++;
      } else if (!runningPart01) {
        if (this.tick >= 0) {
          nextNode.cart = this;
          this.tick++;
        }
      }
    } else {
      throw new Error('Cart move error.')
    }
  }
}

const parseTrackNode = (left, top, content) => {
  if (!content.trim()) {
    return null;
  }
  const position = track.getOrCreatePosition(left, top);
  return track.getOrCreateTrackNode(position, content);
};

const input = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map((line, top) => line
    .split('')
    .map((content, left) => parseTrackNode(left, top, content)));

console.log(`carts count: ${track.cartMap.size}`);

/*console.log(`lines count: ${input.length}`);

for (let line of input) {
  console.log(`node count: ${line.filter(n => !!n).length}`);
}

console.log(`trackNodes count: ${track.trackNodeMap.size}`);*/

// set directions on nodes with carts and add neighbors
for (let node of track.trackNodeMap.values()) {
  const leftNeighbor = track.trackNodeMap.get(node.position.leftNeighbor);
  const topNeighbor = track.trackNodeMap.get(node.position.topNeighbor);
  const rightNeighbor = track.trackNodeMap.get(node.position.rightNeighbor);
  const bottomNeighbor = track.trackNodeMap.get(node.position.bottomNeighbor);
  if (node.path === PATH.UNKNOWN) {
    const cart = track.cartMap.get(node.position);
    if (!cart) throw new Error('Node without cart cannot have an unknown path');
    switch (cart.direction) {

      case DIRECTION.RIGHT:
      case DIRECTION.LEFT:
        if (leftNeighbor && rightNeighbor) {
          node.path = PATH.HORIZONTAL;
        } else {
          throw new Error('WAT 1');
        }
        break;
      case DIRECTION.UP:
      case DIRECTION.DOWN:
        if (topNeighbor && bottomNeighbor) {
          node.path = PATH.VERTICAL;
        } else {
          throw new Error('WAT 2');
        }
        break;
      default:
        throw new Error('WAT 3');
    }
  }
}

for (let node of track.trackNodeMap.values()) {
  const leftNeighbor = track.trackNodeMap.get(node.position.leftNeighbor);
  const topNeighbor = track.trackNodeMap.get(node.position.topNeighbor);
  const rightNeighbor = track.trackNodeMap.get(node.position.rightNeighbor);
  const bottomNeighbor = track.trackNodeMap.get(node.position.bottomNeighbor);
  // add neighbors
  switch (node.path) {
    case PATH.HORIZONTAL:
      if (leftNeighbor && rightNeighbor) {
        node.addNeighbor(leftNeighbor);
        node.addNeighbor(rightNeighbor);
      } else {
        throw new Error('WAT 7');
      }
      break;
    case PATH.VERTICAL:
      if (topNeighbor && bottomNeighbor) {
        node.addNeighbor(topNeighbor);
        node.addNeighbor(bottomNeighbor);
      } else {
        throw new Error('WAT 8');
      }
      break;
    case PATH.INTERSECTION:
      if (leftNeighbor && rightNeighbor && topNeighbor && bottomNeighbor) {
        node.addNeighbor(leftNeighbor);
        node.addNeighbor(rightNeighbor);
        node.addNeighbor(topNeighbor);
        node.addNeighbor(bottomNeighbor);
      } else {
        throw new Error('WAT 9');
      }
      break;
    case PATH.SLANT_LEFT:
      if (!!leftNeighbor && !!bottomNeighbor && (leftNeighbor.path === PATH.HORIZONTAL || leftNeighbor.path === PATH.INTERSECTION)) {
        node.addNeighbor(leftNeighbor);
        node.addNeighbor(bottomNeighbor);
      } else if (!!rightNeighbor && !!topNeighbor && (rightNeighbor.path === PATH.HORIZONTAL || rightNeighbor.path === PATH.INTERSECTION)) {
        node.addNeighbor(rightNeighbor);
        node.addNeighbor(topNeighbor);
      } else {
        throw new Error('WAT 4');
      }
      break;
    case PATH.SLANT_RIGHT:
      if (!!leftNeighbor && !!topNeighbor && (leftNeighbor.path === PATH.HORIZONTAL || leftNeighbor.path === PATH.INTERSECTION)) {
        node.addNeighbor(leftNeighbor);
        node.addNeighbor(topNeighbor);
      } else if (!!rightNeighbor && !!bottomNeighbor && (rightNeighbor.path === PATH.HORIZONTAL || rightNeighbor.path === PATH.INTERSECTION)) {
        node.addNeighbor(rightNeighbor);
        node.addNeighbor(bottomNeighbor);
      } else {
        throw new Error('WAT 5');
      }
      break;
    default:
      throw new Error('WAT 6');
  }
}

// part 01

while (runningPart01 && !track.foundCrash) {
  for (let cart of track.cartsInOrder) {
    cart.move();
  }
  track.paint();
  track.tick++;
}

// part 02
while (!runningPart01 && track.cartsInOrder.length > 1) {
  for (let cart of track.cartsInOrder) {
    cart.move();
  }
  track.paint();
  track.tick++;
}
if (!runningPart01) console.log(`FOUND LAST CART AT: ${track.cartsInOrder[0].position}`);