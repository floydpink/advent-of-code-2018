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

const OPCODES = {
  [OPCODE_NAME.ADDR] : 100,
  [OPCODE_NAME.ADDI] : 101,
  [OPCODE_NAME.MULR] : 102,
  [OPCODE_NAME.MULI] : 103,
  [OPCODE_NAME.BANR] : 104,
  [OPCODE_NAME.BANI] : 105,
  [OPCODE_NAME.BORR] : 106,
  [OPCODE_NAME.BORI] : 107,
  [OPCODE_NAME.SETR] : 108,
  [OPCODE_NAME.SETI] : 109,
  [OPCODE_NAME.GTIR] : 110,
  [OPCODE_NAME.GTRI] : 111,
  [OPCODE_NAME.GTRR] : 112,
  [OPCODE_NAME.EQIR] : 113,
  [OPCODE_NAME.EQRI] : 114,
  [OPCODE_NAME.EQRR] : 115
};

// manually figured out opcodes
/*const OPCODE = {
  9  : OPCODE_NAME.ADDR,
  6  : OPCODE_NAME.ADDI,
  8  : OPCODE_NAME.MULR,
  0  : OPCODE_NAME.MULI,
  14 : OPCODE_NAME.BANR,
  11 : OPCODE_NAME.BANI,
  1  : OPCODE_NAME.BORR,
  10 : OPCODE_NAME.BORI,
  7  : OPCODE_NAME.SETR,
  12 : OPCODE_NAME.SETI,
  15 : OPCODE_NAME.GTIR,
  2  : OPCODE_NAME.GTRI,
  4  : OPCODE_NAME.GTRR,
  5  : OPCODE_NAME.EQIR,
  3  : OPCODE_NAME.EQRI,
  13 : OPCODE_NAME.EQRR,
};*/

// placeholder to dynamically derive the opcodes
const OPCODE = {};

class Instruction {
  constructor(id, instruction, registers) {
    this.id = id;
    this.instruction = instruction;
    this.registers = registers;
  }

  get opcode() {
    return OPCODE[this.instruction[0]] || this.instruction[0];
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

class InstructionSample extends Instruction {
  constructor(id, before, after, instruction) {
    super(id, instruction, before);
    this.before = before;
    this.after = after;
    this.validOpcodes = null;
  }

  get validForCount() {
    if (this.validOpcodes != null) return this.validOpcodes.length;

    this.validOpcodes = [];
    let validForCount = 0;
    let validOpcode = null;

    // the filter here is to help with dynamically deriving the opcode values
    for (let opcode of Object.entries(OPCODES).filter(a => a[1] > 99)) {
      const before = this.before.slice();
      const after = this.after.slice();

      const result = before.slice();
      switch (opcode[0]) {
        case OPCODE_NAME.ADDR:
          result[this.C] = this.AR + this.BR;
          validOpcode = OPCODE_NAME.ADDR;
          break;

        case OPCODE_NAME.ADDI:
          result[this.C] = this.AR + this.B;
          validOpcode = OPCODE_NAME.ADDI;
          break;

        case OPCODE_NAME.MULR:
          result[this.C] = this.AR * this.BR;
          validOpcode = OPCODE_NAME.MULR;
          break;

        case OPCODE_NAME.MULI:
          result[this.C] = this.AR * this.B;
          validOpcode = OPCODE_NAME.MULI;
          break;

        case OPCODE_NAME.BANR:
          result[this.C] = this.AR & this.BR;
          validOpcode = OPCODE_NAME.BANR;
          break;

        case OPCODE_NAME.BANI:
          result[this.C] = this.AR & this.B;
          validOpcode = OPCODE_NAME.BANI;
          break;

        case OPCODE_NAME.BORR:
          result[this.C] = this.AR | this.BR;
          validOpcode = OPCODE_NAME.BORR;
          break;

        case OPCODE_NAME.BORI:
          result[this.C] = this.AR | this.B;
          validOpcode = OPCODE_NAME.BORI;
          break;

        case OPCODE_NAME.SETR:
          result[this.C] = this.AR;
          validOpcode = OPCODE_NAME.SETR;
          break;

        case OPCODE_NAME.SETI:
          result[this.C] = this.A;
          validOpcode = OPCODE_NAME.SETI;
          break;

        case OPCODE_NAME.GTIR:
          result[this.C] = (this.A > this.BR) ? 1 : 0;
          validOpcode = OPCODE_NAME.GTIR;
          break;

        case OPCODE_NAME.GTRI:
          result[this.C] = (this.AR > this.B) ? 1 : 0;
          validOpcode = OPCODE_NAME.GTRI;
          break;

        case OPCODE_NAME.GTRR:
          result[this.C] = (this.AR > this.BR) ? 1 : 0;
          validOpcode = OPCODE_NAME.GTRR;
          break;

        case OPCODE_NAME.EQIR:
          result[this.C] = (this.A === this.BR) ? 1 : 0;
          validOpcode = OPCODE_NAME.EQIR;
          break;

        case OPCODE_NAME.EQRI:
          result[this.C] = (this.AR === this.B) ? 1 : 0;
          validOpcode = OPCODE_NAME.EQRI;
          break;

        case OPCODE_NAME.EQRR:
          result[this.C] = (this.AR === this.BR) ? 1 : 0;
          validOpcode = OPCODE_NAME.EQRR;
          break;

        default:
          validOpcode = null;
          break;
      }

      let opcodeValid = false;
      if (result.length === after.length) {
        opcodeValid = true;
        for (let j = 0; j < result.length; j++) {
          if (result[j] !== after[j]) {
            opcodeValid = false;
            break;
          }
        }
        if (opcodeValid) {
          validForCount++;
          this.validOpcodes.push(validOpcode);
        }
      }
    }

    return validForCount;
  }

  get isValidForNone() {
    return this.validForCount === 0;
  }

  get isValidForOne() {
    return this.validForCount === 1;
  }

  get isValidForTwo() {
    return this.validForCount === 2;
  }

  get isValidForThreeOrMore() {
    return this.validForCount > 2;
  }

}

const trimFunc = i => i.trim();
const parseIntFunc = i => parseInt(i, 10);
const inputLines = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc);

const instructions = [];
const part01LinesCount = inputPath === 'input.txt' ? 3228 : 3;
for (let i = 0; i < part01LinesCount; i++) {
  let before = JSON.parse(inputLines[i++].substring('Before: '.length).trim());
  let instruction = inputLines[i++].trim().split(' ').map(parseIntFunc);
  let after = JSON.parse(inputLines[i++].substring('After:  '.length).trim());
  instructions.push(new InstructionSample(i, before, after, instruction));
}

/*console.log(instructions.length);
console.log(instructions);

for (let inst of instructions) {
  console.log(`validForCount: ${inst.validForCount}`);
  // console.log(`isValidForThreeOrMore: ${inst.isValidForThreeOrMore}`);
}*/

console.log(`part 01 answer: ${instructions.filter(i => i.isValidForThreeOrMore).length}`);

// part 02

/*
// figuring out opcodes for part 02 manually, one at a time
console.log(`valid for none: ${instructions.filter(i => i.isValidForNone).length}`);
console.log(`valid for only one: ${instructions.filter(i => i.isValidForOne).length}`);
console.log(`valid for only two: ${instructions.filter(i => i.isValidForTwo).length}`);
console.log(`valid for three or more: ${instructions.filter(i => i.isValidForThreeOrMore).length}`);

for (let inst of instructions.filter(i => i.isValidForOne)) {
  console.log(inst.id, inst.opcode, inst.validOpcodes);
}
*/

// dynamically derive the opcode values!
while (Object.keys(OPCODE).length < 16) {
  let uniqueOpcodeMap = new Map();
  instructions.filter(i => i.isValidForOne)
    .forEach(i => uniqueOpcodeMap.set(i.opcode, i.validOpcodes[0]));

  for (let derivedOpcode of uniqueOpcodeMap.entries()) {
    OPCODES[derivedOpcode[1]] = derivedOpcode[0];
    OPCODE[derivedOpcode[0]] = derivedOpcode[1];
  }

  // trigger recalculation
  instructions.forEach(i => i.validOpcodes = null);
}

// console.log(Object.keys(OPCODE).length);

const instructions02 = [];
const part02LinesStart = 3230;
const registers = [null, null, null, null];
for (let i = part02LinesStart; i < inputLines.length; i++) {
  let instruction = inputLines[i].trim().split(' ').map(parseIntFunc);
  instructions02.push(new Instruction((i - part02LinesStart) + 1, instruction, registers));
}

for (let inst of instructions02) {
  inst.run();
}

console.log(`part 02 answer: ${registers[0]}`);
