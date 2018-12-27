const fs = require('fs');

let inputPath = 'input.txt';
const debug = (...message) => {
  // enable this to debug
  if (false) console.log(...message);
};

let facility;
let roomId = 0;

const DIRECTION_TYPE = {
  START        : '^',
  END          : '$',
  NORTH        : 'N',
  EAST         : 'E',
  SOUTH        : 'S',
  WEST         : 'W',
  BRANCH_START : '(',
  BRANCH_END   : ')',
  BRANCH       : '|'
};

class Room {
  constructor(x, y) {
    this.id = roomId++;
    this.y = y;
    this.x = x;
    this.distanceFromStart = Number.POSITIVE_INFINITY;
  }

  toString() {
    return ` x:${this.x}|y:${this.y} `;
  }

  get key() {
    return Room.createKey(this.x, this.y);
  }

  static createKey(x, y) {
    return `${x}|${y}`;
  }
}

class Facility {
  constructor() {
    this.rooms = new Map();
  }

  getOrCreateRoom(x, y) {
    const key = Room.createKey(x, y);
    if (!this.rooms.has(key)) {
      const square = new Room(x, y);
      this.rooms.set(key, square);
    }
    return this.rooms.get(key);
  }

  getRoom(x, y) {
    return this.rooms.get(Room.createKey(x, y));
  }
}

facility = new Facility();

const trimFunc = i => i.trim();
const regexMap = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc)[0];

debug(regexMap.length);
// debug(regexMap);

let currentRoom = facility.getOrCreateRoom(0, 0);
currentRoom.distanceFromStart = 0;
const stack = [currentRoom];

const addRoom = function(dx, dy) {
  const room = facility.getOrCreateRoom(currentRoom.x + dx, currentRoom.y + dy);
  room.distanceFromStart = Math.min(room.distanceFromStart, currentRoom.distanceFromStart + 1);
  currentRoom = room;
};

let i = 1;
while (i < regexMap.length - 1) {
  const char = regexMap[i];

  switch (char) {
    case DIRECTION_TYPE.BRANCH_START:
      stack.push(currentRoom);
      break;
    case DIRECTION_TYPE.BRANCH:
      currentRoom = stack[stack.length - 1];
      break;
    case DIRECTION_TYPE.BRANCH_END:
      stack.pop();
      break;
    case DIRECTION_TYPE.NORTH:
      addRoom(0, 1);
      break;
    case DIRECTION_TYPE.EAST:
      addRoom(1, 0);
      break;
    case DIRECTION_TYPE.SOUTH:
      addRoom(0, -1);
      break;
    case DIRECTION_TYPE.WEST:
      addRoom(-1, 0);
      break;
  }

  i++;
}

const rooms = Array.from(facility.rooms.values());

debug(rooms.length);
// debug(rooms);

const distances = rooms.map(r => r.distanceFromStart);
// debug(distances);

console.log(`part 01 answer: ${Math.max.apply(null, distances)}`);
console.log(`part 02 answer: ${distances.filter(d => d >= 1000).length}`);
