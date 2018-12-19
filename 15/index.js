const fs = require('fs');
let turn = 0;
const inputPath = 'input.txt';
const debug = (...message) => {
  // enable this to debug
  if (false) console.log(...message);
};
const paint = (...message) => {
  // enable this to visualize
  if (false) console.log(...message);
};

const NODE_TYPE = {
  WALL   : 0,
  OPEN   : 1,
  GOBLIN : 2,
  ELF    : 3,
};

const NODE_SYMBOL = {
  '#' : NODE_TYPE.WALL,
  '.' : NODE_TYPE.OPEN,
  'G' : NODE_TYPE.GOBLIN,
  'E' : NODE_TYPE.ELF
};

const NODE = {};
for (let node of Object.entries(NODE_SYMBOL)) {
  NODE[node[1]] = node[0];
}

const readingOrderSort = (a, b) => {
  if (a.position.top === b.position.top) {
    return a.position.left - b.position.left;
  }

  return a.position.top - b.position.top;
};

class Cavern {
  constructor(input, elfAttackPower = 3) {
    this.width = input[0].length;
    this.height = input.length;
    this.elfAttackPower = elfAttackPower;
    this.firstElfDied = false;

    this.positionMap = new Map();
    this.nodeMap = new Map();
    this.elves = new Map();
    this.goblins = new Map();

    this.turn = 0;

    this.initializeMap();
  }

  initializeMap() {
    for (let left = 0; left < this.width; left++) {
      for (let top = 0; top < this.height; top++) {
        const position = new Position(top, left);
        this.positionMap.set(position.key, position);

        const nodeType = NODE_SYMBOL[input[top][left]];
        const node = nodeType === NODE_TYPE.WALL ? new Wall(position) : new Open(position);

        this.nodeMap.set(position, node);
        this.addUnit(position, nodeType);
      }
    }

    debug(`height           : ${this.height}`);
    debug(`width            : ${this.width}`);
    debug(`nodes count      : ${this.nodeMap.size}`);

    const nodes = Array.from(this.nodeMap.values());
    debug(`walls count      : ${nodes.filter(n => n.type === NODE_TYPE.WALL).length}`);
    debug(`open spots count : ${nodes.filter(n => n.type === NODE_TYPE.OPEN).length}`);
    debug(`elves count      : ${this.elves.size}`);
    debug(`goblins count    : ${this.goblins.size}`);

    this.initializeNodeDistances();

    this.paint();
  }

  initializeNodeDistances() {
    for (let node of this.openNodes) {
      node.distance = Number.MAX_SAFE_INTEGER;
      node.previous = null;
    }
  }

  get openNodes() {
    return Array.from(this.nodeMap.values())
      .filter(n => n.type === NODE_TYPE.OPEN)
      .sort(readingOrderSort);
  }

  getPosition(top, left) {
    return this.positionMap.get(Position.createKey(top, left));
  }

  getNode(position) {
    return this.nodeMap.get(position);
  }

  getUnit(position) {
    let unit = this.elves.get(position);
    if (!unit) {
      unit = this.goblins.get(position);
    }

    return unit;
  }

  addUnit(position, nodeType) {
    if (nodeType === NODE_TYPE.ELF) {
      this.elves.set(position, new Elf(position, this.elfAttackPower));
    } else if (nodeType === NODE_TYPE.GOBLIN) {
      this.goblins.set(position, new Goblin(position));
    }
  }

  killUnit(position) {
    let unit = this.elves.get(position);
    if (!!unit) {
      this.elves.delete(position);
      this.firstElfDied = true;
    } else {
      this.goblins.delete(position);
    }
  }

  getAliveUnitsInOrder(type = null) {
    let elves = Array.from(this.elves.values());
    let goblins = Array.from(this.goblins.values());

    let units = elves;

    if (!type) {
      units = units.concat(goblins);
    } else if (type === NODE_TYPE.GOBLIN) {
      units = goblins;
    }

    return units
      .filter(u => u.isAlive)
      .sort(readingOrderSort);
  }

  get aliveUnitsInOrder() {
    return this.getAliveUnitsInOrder();
  }

  get aliveElvesInOrder() {
    return this.getAliveUnitsInOrder(NODE_TYPE.ELF);
  }

  get aliveGoblinsInOrder() {
    return this.getAliveUnitsInOrder(NODE_TYPE.GOBLIN);
  }

  finishRound(allUnitsPlayed = false) {
    if ((this.aliveElvesInOrder.length !== 0 && this.aliveGoblinsInOrder.length !== 0) || allUnitsPlayed) {
      this.turn++;
      turn++;
    }

    this.paint();
  }

  moveUnit(unit, fromPosition, toPosition) {
    if (cavern.getUnit(fromPosition) !== unit) {
      throw new Error('Invalid fromPosition');
    }

    if (unit.position !== fromPosition) {
      throw new Error('Invalid fromPosition');
    }

    if (cavern.getUnit(toPosition)) {
      debug(`toPosition now has ${cavern.getUnit(toPosition)}`);
    }

    unit.position = toPosition;

    if (unit.type === NODE_TYPE.ELF) {
      this.elves.delete(fromPosition);
      this.elves.set(toPosition, unit);
    } else {
      this.goblins.delete(fromPosition);
      this.goblins.set(toPosition, unit);
    }
  }

  paint() {
    paint();
    paint(`turns finished: ${this.turn} (elfAttackPower: ${this.elfAttackPower})`);
    for (let top = 0; top < this.height; top++) {
      let cavernLine = '';
      let lineUnits = [];
      for (let left = 0; left < this.width; left++) {
        let pixel = ' ';
        for (let node of this.nodeMap.values()) {
          if (node.position.left === left && node.position.top === top) {
            pixel = NODE[node.type];
            break;
          }
        }
        for (let elf of this.elves.values()) {
          if (elf.isAlive && elf.position.left === left && elf.position.top === top) {
            pixel = NODE[NODE_TYPE.ELF];
            lineUnits.push(elf);
            break;
          }
        }
        for (let goblin of this.goblins.values()) {
          if (goblin.isAlive && goblin.position.left === left && goblin.position.top === top) {
            pixel = NODE[NODE_TYPE.GOBLIN];
            lineUnits.push(goblin);
            break;
          }
        }
        cavernLine += pixel;
      }
      cavernLine += `\t ${lineUnits.map(l => `${l.id}:${NODE[l.type]}(${l.hitPoints})}`)}`;
      paint(cavernLine);
    }

    paint('');
  }
}

let cavern;

class Position {
  constructor(top, left) {
    this.top = top;
    this.left = left;
  }

  toString() {
    return `(${this.left},${this.top})`;
  }

  get key() {
    return Position.createKey(this.top, this.left);
  }

  static createKey(top, left) {
    return `${left}|${top}`;
  }

  get topNeighbor() {
    return cavern.getPosition(this.top - 1, this.left);
  }

  get rightNeighbor() {
    return cavern.getPosition(this.top, this.left + 1);
  }

  get bottomNeighbor() {
    return cavern.getPosition(this.top + 1, this.left);
  }

  get leftNeighbor() {
    return cavern.getPosition(this.top, this.left - 1);
  }

  get neighbors() {
    return [this.topNeighbor, this.rightNeighbor, this.bottomNeighbor, this.leftNeighbor]
      .filter(n => !!n);
  }
}

let nodeId = 0;

class Node {
  constructor(position, type = NODE_TYPE.WALL) {
    this.id = nodeId++;
    this.position = position;
    this.type = type;
    this.distance = Number.MAX_SAFE_INTEGER;
    this.previous = null;
  }

  toString() {
    return `[${this.id} ${NODE[this.type]}${this.position}]`;
  }

  get neighbors() {
    return this.position
      .neighbors
      .map(p => cavern.getNode(p))
      .sort(readingOrderSort);
  }

  get openNeighbors() {
    return this.neighbors.filter(n => n.type !== NODE_TYPE.WALL);
  }

  get openAndEmptyNeighbors() {
    return this.openNeighbors.filter(n => !n.hasUnit);
  }

  get openAndOccupiedNeighbors() {
    return this.openNeighbors.filter(n => n.hasUnit);
  }

  isReachableFrom(node) {
    const queue = [];
    const visited = new Set();
    queue.push(this);

    while (queue.length > 0) {
      let current = queue.shift();
      if (!visited.has(current)) {
        if (current === node) return true;
        visited.add(current);
        current.openAndEmptyNeighbors.forEach(n => queue.push(n));
      }
    }
    return false;
  }

  findMinimumDistancePathTo(node) {
    const queue = [];
    const visited = new Set();

    this.distance = 0;
    this.previous = null;
    queue.push(this);

    while (queue.length > 0) {
      let current = queue.shift();
      if (current === node) {
        return Node.findPath(current);
      }

      for (let neighbor of current.openAndEmptyNeighbors) {
        if (visited.has(neighbor)) {
          continue;
        }

        neighbor.distance = current.distance + 1;
        neighbor.previous = current;
        let existingPathSegment = queue.find(v => v === neighbor);
        if (existingPathSegment) {
          if (existingPathSegment.distance > neighbor.distance) {
            debug('!!!handle this...');
          }
        } else {
          queue.push(neighbor);
        }
      }

      visited.add(current);
    }

    return [];
  }

  static findPath(destinationNode) {
    let path = [];
    let current = destinationNode;
    while (current.previous !== null) {
      path.push(current);
      current = current.previous;
    }

    path = path.reverse();

    return {
      distance : destinationNode.distance,
      path,
      toString : () => ` (${destinationNode.distance}) ${path} `
    };
  }
}

class Wall extends Node {
  constructor(position) {
    super(position);
  }
}

class Open extends Node {
  constructor(position) {
    super(position, NODE_TYPE.OPEN);
  }

  get hasUnit() {
    let unit = cavern.getUnit(this.position);
    return !!unit && unit.isAlive;
  }

  toString() {
    return `{ ${super.toString()}${(this.hasUnit ? this.unit : '')} }`;
  }

  get unit() {
    if (this.hasUnit) {
      return cavern.getUnit(this.position);
    }

    return undefined;
  }
}

let unitId = 0;

class Unit {
  constructor(position, type, attackPower = 3) {
    this.id = unitId++;
    this.position = position;
    this.type = type;
    this.turn = 0;
    this._hitPoints = 200;
    this._attackPower = attackPower;
  }

  toString() {
    return `[${this.id} ${NODE[this.type]} ${this.hitPoints} ${this.position}]`;
  }

  get attackPower() {
    return this._attackPower;
  }

  get hitPoints() {
    return this._hitPoints;
  }

  get isAlive() {
    return this.hitPoints > 0;
  }

  get node() {
    return cavern.getNode(this.position);
  }

  get enemyType() {
    return this.type === NODE_TYPE.ELF ? NODE_TYPE.GOBLIN : NODE_TYPE.ELF;
  }

  // in range squares
  get openAndEmptyNeighbors() {
    return this.node.openAndEmptyNeighbors;
  }

  get adjacentUnits() {
    return this.node.openAndOccupiedNeighbors.map(n => cavern.getUnit(n.position));
  }

  get adjacentTargets() {
    return this.adjacentUnits
      .filter(u => u.type === this.enemyType)
      .sort((a, b) => {
        if (a.hitPoints === b.hitPoints) {
          return readingOrderSort(a, b);
        }

        return a.hitPoints - b.hitPoints;
      })
  }

  get allTargets() {
    return cavern.getAliveUnitsInOrder(this.enemyType);
  }

  get allTargetSquares() {
    return this.allTargets.map(t => {
      const inRangeSquares = t.openAndEmptyNeighbors;
      return {
        target   : t,
        inRange  : inRangeSquares,
        toString : () => ` ${t}(${inRangeSquares.length}) >> ${inRangeSquares} `
      };
    });
  }

  get reachableTargetSquares() {
    return this.allTargetSquares
      .map(t => {
        const reachableInRangeSquares = t.inRange.filter(n => this.node.isReachableFrom(n));
        return {
          target           : t.target,
          reachableInRange : reachableInRangeSquares,
          toString         : () => ` ${t.target}(${reachableInRangeSquares.length}) => ${reachableInRangeSquares} `
        };
      })
      .filter(t => t.reachableInRange.length > 0);
  }

  get reachableTargetSquaresByDistance() {
    return this.reachableTargetSquares.map(t => {
      const squaresWithDistance = t.reachableInRange.map(s => {
        // let path = cavern.getDistance(this.node, s);
        let path = this.node.findMinimumDistancePathTo(s);
        const distance = path.distance;
        return {
          square   : s,
          distance : distance,
          toString : () => ` ${s.position} > ((${path.path})) ("${distance}") `
          /*toString : () => ` ${s.position} > ("${distance}") `*/
        };
      });
      return {
        target                     : t.target,
        reachableInRangeByDistance : squaresWithDistance,
        toString                   : () => ` ${t.target}(${squaresWithDistance.length}) => ${squaresWithDistance} `
      };
    });
  }

  takeTurn() {
    if (!this.isAlive) {
      debug(`Unit ${this} is already dead... no moves`);
      return;
    } else if (this.adjacentTargets.length > 0) {
      this.attack();
    } else {
      this.findMove();
      if (this.adjacentTargets.length > 0) {
        this.attack();
      }
    }
    this.turn++;
  }

  attack() {
    let target = this.adjacentTargets[0];
    debug(`${this} is going to attack ${target}`);
    target.receiveBlow(this.attackPower);
  }

  findMove() {
    if (!this.openAndEmptyNeighbors.length) {
      debug('no move');
      return;
    }

    debug(`adjacentTargets (${this.adjacentTargets.length}):`);
    if (this.adjacentTargets.length) debug(`  ${this.adjacentTargets}`);
    debug(`openAndEmptyNeighbors (${this.openAndEmptyNeighbors.length}):`);
    if (this.openAndEmptyNeighbors.length) debug(`  ${this.openAndEmptyNeighbors}`);

    debug(`allTargets (${this.allTargets.length})`);
    debug(`allTargetSquares (${this.allTargetSquares.length}):`);
    if (this.allTargetSquares.length) debug(`  ${this.allTargetSquares}`);
    debug(`reachableTargetSquares (${this.reachableTargetSquares.length}):`);
    if (this.reachableTargetSquares.length) debug(`  ${this.reachableTargetSquares}`);
    debug(`reachableTargetSquaresByDistance (${this.reachableTargetSquaresByDistance.length}):`);
    if (this.reachableTargetSquaresByDistance.length) debug(`  ${this.reachableTargetSquaresByDistance}`);

    if (!this.reachableTargetSquares.length) {
      debug('no reachable targets');
      return;
    }

    let minimumDistance = Number.MAX_SAFE_INTEGER;
    for (let t of this.reachableTargetSquaresByDistance) {
      for (let s of t.reachableInRangeByDistance) {
        minimumDistance = Math.min(minimumDistance, s.distance);
      }
    }

    debug(`minimumDistance: ${minimumDistance}`);

    let chosenTarget = null;
    const filteredTargets = this.reachableTargetSquaresByDistance
      .filter(t => {
        return t.reachableInRangeByDistance.find(r => r.distance === minimumDistance)
      })
      .sort((a, b) => {
        return readingOrderSort(a.target, b.target);
      });
    debug(`filteredTargets (${filteredTargets.length}):`);
    if (filteredTargets.length) debug(`  ${filteredTargets}`);

    chosenTarget = filteredTargets[0];

    debug(`chosenTarget: ${chosenTarget}`);
    const distancesFromChosenTargetToAdjacentSquares = this.openAndEmptyNeighbors
      .map(n => {
        const path = chosenTarget.target.node.findMinimumDistancePathTo(n);
        const distance = (path.distance !== undefined) ? path.distance : Number.MAX_SAFE_INTEGER;
        return {
          node     : n,
          distance : distance,
          toString : () => ` ${n} => ((${distance}))`
        };
      })
      .sort((a, b) => {
        if (a.distance === b.distance) {
          return readingOrderSort(a.node, b.node);
        }
        return a.distance - b.distance;
      });

    debug(`distancesFromChosenTargetToAdjacentSquares (${distancesFromChosenTargetToAdjacentSquares.length}):`);
    if (distancesFromChosenTargetToAdjacentSquares.length) debug(`  ${distancesFromChosenTargetToAdjacentSquares}`);

    let nextSquare = distancesFromChosenTargetToAdjacentSquares[0].node;
    if (nextSquare == null) {
      return;
    }

    if (!this.openAndEmptyNeighbors.includes(nextSquare)) {
      throw new Error('Invalid path computation');
    } else {
      debug(`moving ${this} to ${nextSquare}`);
      cavern.moveUnit(this, this.position, nextSquare.position);
    }
  }

  receiveBlow(attackPower) {
    this._hitPoints -= attackPower;
    if (this._hitPoints <= 0) {
      debug(`Unit ${this.id} dies!!!`);
      cavern.killUnit(this.position);
    }
  }
}

class Elf extends Unit {
  constructor(position, attackPower) {
    super(position, NODE_TYPE.ELF, attackPower);
  }
}

class Goblin extends Unit {
  constructor(position) {
    super(position, NODE_TYPE.GOBLIN);
  }
}

let trimFunc = i => i.trim();
const input = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc)
  .map(l => l.split(''));

// part 01
cavern = new Cavern(input);

while (cavern.aliveElvesInOrder.length !== 0 && cavern.aliveGoblinsInOrder.length !== 0 /*&& cavern.turn < 30*/) {
  let aliveUnits = cavern.aliveUnitsInOrder.slice();
  debug(`aliveUnits: ${aliveUnits.length}`);

  for (let unit of aliveUnits) {
    debug(`\n main: unit #${unit.id}: ${unit}`);
    unit.takeTurn();
  }

  cavern.finishRound();
}

const part01answer = cavern.turn * cavern.aliveUnitsInOrder.reduce((p, c) => p + c.hitPoints, 0);
console.log(`part 01 answer: ${part01answer}`);

// part 02
let elfFavoringOutcome = false;

let attackPower = 3;
while (!elfFavoringOutcome) {
  cavern = new Cavern(input, attackPower++);
  debug('');
  debug('>>>');
  debug(`Simulating combat with elfAttackPower bumped up to ${cavern.elfAttackPower}`);
  while (!cavern.firstElfDied && cavern.aliveElvesInOrder.length !== 0 && cavern.aliveGoblinsInOrder.length !== 0 /*&& cavern.turn < 30*/) {
    let aliveUnits = cavern.aliveUnitsInOrder.slice();
    debug(`aliveUnits: ${aliveUnits.length}`);

    let playedUnitsCount = 0;
    for (let unit of aliveUnits) {
      debug(`\n main: unit #${unit.id}: ${unit}`);
      unit.takeTurn();
      playedUnitsCount++;
      if (cavern.aliveGoblinsInOrder.length === 0) {
        break;
      }
    }

    cavern.finishRound(playedUnitsCount === aliveUnits.length);
  }

  if (!cavern.firstElfDied) {
    debug('success...');
    elfFavoringOutcome = true;
  } else {
    debug('not enough attackPower for the elves...');
  }
}

const part02answer = cavern.turn * cavern.aliveUnitsInOrder.reduce((p, c) => p + c.hitPoints, 0);
console.log(`part 02 answer: ${part02answer}`);

// took 17 minutes 20 seconds to solve both parts