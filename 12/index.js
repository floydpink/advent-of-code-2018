const fs = require('fs');

const inputPath = 'input.txt';

const trimFunc = i => i.trim();
const inputLines = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc);

class Pot {
  constructor(number, plant = Pot.withoutPlant) {
    this.number = number;
    this.plantState = plant;
  }

  static get withoutPlant() {
    return '.';
  }

  static get withPlant() {
    return '#';
  }

  get hasPlant() {
    return this.plantState === Pot.withPlant;
  }
}

const initialState = inputLines[0]
  .substring('initial state: '.length)
  .split('')
  .map((plant, number) => new Pot(number, plant));
// console.log(initialState);
// console.log(initialState.length);

const spreadPatterns = inputLines.slice(2).map(i => i.split('=>').map(trimFunc));

// console.log(spreadPatterns.length);

const spreadPatternMap = new Map();
for (let pattern of spreadPatterns) {
  if (spreadPatternMap.has(pattern[0])) {
    throw new Error ('duplicate pattern!?');
  }
  spreadPatternMap.set(pattern[0], pattern[1]);
}

// console.log(spreadPatternMap.size);
// console.log(spreadPatternMap);

const checkGenerations = function (generationsCount, currentState) {
  const getPotSpreadPattern = function (currentPotState, currentIdx) {
    const secondLeftPot = currentPotState[currentIdx - 2];
    const leftPot = currentPotState[currentIdx - 1];
    const currentPot = currentPotState[currentIdx];
    const rightPot = currentPotState[currentIdx + 1];
    const secondRightPot = currentPotState[currentIdx + 2];

    const currentPotPattern = `${secondLeftPot.plantState}${leftPot.plantState}${currentPot.plantState}${!!rightPot ? rightPot.plantState : Pot.withoutPlant}${!!secondRightPot ? secondRightPot.plantState : Pot.withoutPlant}`;

    return {currentPot, currentPotPattern};
  };

  for (let i = 0; i < generationsCount; i++) {
    // console.log(`after ${i} generations: ${currentState.length}:`);
    // console.log(`\t${currentState.map(c => `${c.plantState}${c.number === 0 ? '*' : ''}`).join('')}`);

    // copy previous
    let previousState = currentState.slice();

    // add three unknown ones to the left
    for (let k = 0; k < 3; k++) {
      previousState.splice(0, 0, new Pot(previousState[0].number - 1));
    }

    // add three unknown ones to the right
    for (let k = 0; k < 3; k++) {
      previousState.push(new Pot(previousState[previousState.length - 1].number + 1));
    }

    currentState = [];
    for (let j = 2; j < previousState.length; j++) {
      const {currentPot, currentPotPattern} = getPotSpreadPattern(previousState, j);
      if (spreadPatternMap.has(currentPotPattern)) {
        currentState.push(new Pot(currentPot.number, spreadPatternMap.get(currentPotPattern)));
      } else {
        currentState.push(new Pot(currentPot.number));
      }
    }

    const potsWithPlants = currentState.filter(p => p.hasPlant).sort((a, b) => a.number - b.number);
    currentState = currentState.filter(c => c.number >= potsWithPlants[0].number && c.number <= potsWithPlants[potsWithPlants.length - 1].number);
  }

  return currentState;
};

// part 01

const part01EndState = checkGenerations(20, initialState.slice());
const part01Answer = part01EndState.reduce((p, c) => p + ((c.hasPlant) ? c.number : 0), 0);
console.log(`part 01 answer : ${part01Answer}`);

// part 02
const part02EndState = checkGenerations(50000, initialState.slice());
const part02Answer = part02EndState.reduce((p, c) => p + ((c.hasPlant) ? c.number : 0), 0);
console.log(`part 02 answer : ${part02Answer}`);

// since the result for 500, 5000 and 50000 generations are following a pattern,
// let us guess the answer for 50000000000 generations !!

//          20 generations =>          3405 (part 01 answer)
//          50 generations =>          4165 (not useful)
//         500 generations =>         33500
//        5000 generations =>        335000
//       50000 generations =>       3350000
//                                          (therefore...)
// 50000000000 generations => 3350000000000 (part 02 answer)