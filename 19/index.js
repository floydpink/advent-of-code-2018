const fs = require('fs');

let inputPath = 'input.txt';

const OPCODE_NAME = {
  ADDR : 'addr',
  ADDI : 'addi',
  MULR : 'mulr',
  MULI : 'muli',
  BANR : 'banr',
  BANI : 'bani',
  BORR : 'borr',
  BORI : 'bori',
  SETR : 'setr',
  SETI : 'seti',
  GTIR : 'gtir',
  GTRI : 'gtri',
  GTRR : 'gtrr',
  EQIR : 'eqir',
  EQRI : 'eqri',
  EQRR : 'eqrr'
};

class Instruction {
  constructor(id, instruction, registers) {
    this.id = id;
    this.instruction = instruction;
    this.registers = registers;
  }

  get opcode() {
    return this.instruction[0];
  }

  get A() {
    return this.instruction[1];
  }

  get B() {
    return this.instruction[2];
  }

  get C() {
    return this.instruction[3];
  }

  get AR() {
    return this.registers[this.A];
  }

  get BR() {
    return this.registers[this.B];
  }

  run() {
    switch (this.opcode) {
      case OPCODE_NAME.ADDR:
        this.registers[this.C] = this.AR + this.BR;
        break;
      case OPCODE_NAME.ADDI:
        this.registers[this.C] = this.AR + this.B;
        break;
      case OPCODE_NAME.MULR:
        this.registers[this.C] = this.AR * this.BR;
        break;
      case OPCODE_NAME.MULI:
        this.registers[this.C] = this.AR * this.B;
        break;
      case OPCODE_NAME.BANR:
        this.registers[this.C] = this.AR & this.BR;
        break;
      case OPCODE_NAME.BANI:
        this.registers[this.C] = this.AR & this.B;
        break;
      case OPCODE_NAME.BORR:
        this.registers[this.C] = this.AR | this.BR;
        break;
      case OPCODE_NAME.BORI:
        this.registers[this.C] = this.AR | this.B;
        break;
      case OPCODE_NAME.SETR:
        this.registers[this.C] = this.AR;
        break;
      case OPCODE_NAME.SETI:
        this.registers[this.C] = this.A;
        break;
      case OPCODE_NAME.GTIR:
        this.registers[this.C] = (this.A > this.BR) ? 1 : 0;
        break;
      case OPCODE_NAME.GTRI:
        this.registers[this.C] = (this.AR > this.B) ? 1 : 0;
        break;
      case OPCODE_NAME.GTRR:
        this.registers[this.C] = (this.AR > this.BR) ? 1 : 0;
        break;
      case OPCODE_NAME.EQIR:
        this.registers[this.C] = (this.A === this.BR) ? 1 : 0;
        break;
      case OPCODE_NAME.EQRI:
        this.registers[this.C] = (this.AR === this.B) ? 1 : 0;
        break;
      case OPCODE_NAME.EQRR:
        this.registers[this.C] = (this.AR === this.BR) ? 1 : 0;
        break;
      default:
        break;
    }
  }
}

const trimFunc = i => i.trim();
const inputLines = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc);

const registers = [null, null, null, null, null, null];

let ipRegisterIdx = +(inputLines[0].substring('#ip '.length).trim());
console.log(`instruction pointer index: ${ipRegisterIdx}`);
registers[ipRegisterIdx] = 0;

let instructions = [];
for (let i = 1; i < inputLines.length; i++) {
  let instruction = inputLines[i].trim().split(' ').map((part, idx) => {
    if (idx > 0) {
      return parseInt(part, 10);
    }

    return part.trim();
  });
  instructions.push(new Instruction((i - 1), instruction, registers));
}

// console.log(instructions.length);
// console.log(instructions);

// part 01

let instructionPointer = 0;
let previous = registers[0];
let counter1 = 0;
while(instructionPointer >= 0 && instructionPointer < instructions.length) {
  counter1++;
  registers[ipRegisterIdx] = instructionPointer;
  let instruction = instructions[instructionPointer];
  instruction.run();
  instructionPointer = registers[ipRegisterIdx];
  instructionPointer++;
  if (counter1 % 10000000 === 0 || previous !== registers[0]) {
    console.log(`instruction: ${instruction.instruction.join(' ')} (${instructionPointer}) registers02: ${registers}`);
  }
  previous = registers[0];
}

let part01Answer = registers[0];
console.log(`part 01 answer: ${part01Answer}`);

// part 02

instructionPointer = 0;
const registers02 = [1, 0, 0, 0, 0, 0];
instructions = [];
for (let i = 1; i < inputLines.length; i++) {
  let instruction = inputLines[i].trim().split(' ').map((part, idx) => {
    if (idx > 0) {
      return parseInt(part, 10);
    }

    return part.trim();
  });
  instructions.push(new Instruction((i - 1), instruction, registers02));
}

let counter = 0;
previous = registers[0];
while(instructionPointer >= 0 && instructionPointer < instructions.length /*&& counter < 10000*/) {
  counter++;

  // thanks to https://www.reddit.com/r/adventofcode/comments/a7j9zc/2018_day_19_solutions/ec3l7ls/
  // could not solve this myself!
  /*
      #2   addi 5 16 5
          3   seti 1 8 2          R2 = 1
          4   mulr 4 2 3          R3 = R4 * R2
          5   eqrr 3 1 3          R3 = R3 == R1 ? 1 : 0
          6   addr 3 5 5          R5 += R3
       7   addi 5 1 5             R5 += 1
          8   addr 4 0 0          R0 += R4
          9   addi 2 1 2          R2 += 1
          10    gtrr 2 1 3        R3 = R2 > R1 ? 1 : 0
          11    addr 5 3 5        R5 += R3
      12    seti 2 6 5            R5 = 2
      13    addi 4 1 4            R4 += 1
      14    gtrr 4 1 3            R3 = R4 > R1 ? 1 : 0
      15    addr 3 5 5            R5 += R3
      16    seti 1 4 5            R5 = 1
      17    mulr 5 5 5            R5 *= R5

      R2 => r1
      R1 => r5
      R4 => r3
      R5 => r4
      R0 => r0
      R3 => r2

      R2 = 1
      do {
          if (R4 * R2 ==  R1) {
              R0 += R4
          }
          R2 += 1
      } while (R2 <= R1 || R1 <= ++R4)

      if (instructionPointer == 3 && registers02[4] !== 0) {
          if (registers02[1] % registers02[4] === 0) {
              registers02[0] += registers02[4];
          }
          registers02[3] = 0;
          registers02[2] = registers02[1];
          instructionPointer = 13;
      }
  */
  if (instructionPointer === 3 && registers02[4] !== 0) {
      if (registers02[1] % registers02[4] === 0) {
          registers02[0] += registers02[4];
      }
      registers02[3] = 0;
      registers02[2] = registers02[1];
      instructionPointer = 12;
      continue;
  }

  let prevIp = instructionPointer;
  registers02[ipRegisterIdx] = instructionPointer;
  const instruction = instructions[instructionPointer];
  instruction.run();

  instructionPointer = registers02[ipRegisterIdx];
  instructionPointer++;

  if (counter % 10000000 === 0 || previous !== registers[0]) {
    console.log(`${prevIp}: ${instruction.instruction.join(' ')} [ ${registers02} ] next: ${instructionPointer}`);
  }
  previous = registers[0];
}

let part02Answer = registers02[0];
console.log(`part 02 answer: ${part02Answer}`); // 18869760

// validated with the help from https://www.youtube.com/watch?v=74vojWBORpo (WOW !
