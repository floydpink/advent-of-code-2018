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

  toString() {
    return `( ${this.id} : [${this.registers.join(',')}] | ${this.instruction.join(' ')} | )`;
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

const cleanRegisters = [0, 0, 0, 0, 0, 0];
let ipRegisterIdx = +(inputLines[0].substring('#ip '.length).trim());
// console.log(`instruction pointer index: ${ipRegisterIdx}`);
cleanRegisters[ipRegisterIdx] = 0;

const initialize = function (register0) {
  // console.log();
  // console.log(`Initializing instructions with register[0] set to ${register0}`);

  const instructions = [];

  const regs = cleanRegisters.slice();
  regs[0] = register0;

  for (let i = 1; i < inputLines.length; i++) {
    let instruction = inputLines[i].trim().split(' ').map((part, idx) => {
      if (idx > 0) {
        return parseInt(part, 10);
      }

      return part.trim();
    });
    instructions.push(new Instruction((i - 1), instruction, regs));
  }
  return {instructions, registers : regs};
};

let instructionPointer = 0;
let register0 = 1;

let program = initialize(register0);
let instructions = program.instructions;
let registers = program.registers;

let previous = registers[5];
let instructionsCount = 0;
let part01Found = false;

let set = new Set();

let minValue = Number.MAX_SAFE_INTEGER;
while (instructionPointer >= 0 && instructionPointer < instructions.length /*&& instructionsCount < 1000*/) {
  registers[ipRegisterIdx] = instructionPointer;

  let instruction = instructions[instructionPointer];
  instruction.run();
  instructionsCount++;

  // if (previous !== registers[5]) {
  //   console.log(`instruction: ${instruction} (${instructionPointer})`);
  // }

  instructionPointer = registers[ipRegisterIdx];
  instructionPointer++;
  if (instructionPointer === 28) {
    // console.log(`!!! THIS [${instructionsCount}] >>> instruction: ${instruction} (${instructionPointer})`);
    minValue = Math.min(minValue, registers[5]);
    if (minValue === registers[5]) {
      // console.log(`ran instructions count: ${instructionsCount}`);
      if (!part01Found) {
        console.log(`part 01 answer: ${minValue}`);
      }
      part01Found = true;
    }
    if (set.has(registers[5])) {
      // console.log(`ran instructions count: ${instructionsCount}`);
      console.log(`part 02 answer: ${previous}`);
      registers[0] = registers[5];
    }
    set.add(registers[5]);
    previous = registers[5];
  }
}
