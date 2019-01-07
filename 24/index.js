const fs = require('fs');

const inputPath = process.argv[2] === 'test' ? 'input1.txt' : 'input.txt';
const debug = (...message) => {
  // enable this to debug
  if (false) console.log(...message);
};
const GROUP_TYPE = {
  IMMUNE_SYSTEM : 0,
  INFECTION     : 1
};

const groupsCount = inputPath === 'input.txt' ? 10 : 2;

let groupId = 0;

class Group {
  constructor(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities, type) {
    this.id = groupId++;
    this.count = count;
    this.hitPoints = hitPoints;
    this.attackType = attackType;
    this.attackDamage = attackDamage;
    this.initiative = initiative;
    this.weaknesses = weaknesses;
    this.immunities = immunities;
    this.type = type;

    this.effectiveDamage = 0;
    this.defender = null;
    this.attacker = null;
  }

  toString() {
    return ` ${this.name}) c: ${this.count}, h: ${this.hitPoints}, p: ${this.effectivePower} (${this.attackType} ${this.attackDamage}), i:${this.initiative}, wk:${this.weaknesses.join(',')}, im:${this.immunities.join(',')}, d: ${this.effectiveDamage} `;
  }

  get name() {
    const properId = this.id + 1;
    return `${this.type === 0 ? 'Immune System ' : 'Infection'} ${(properId) > groupsCount ? (properId) - groupsCount : properId}`;
  }

  get effectivePower() {
    return this.count * this.attackDamage;
  }

  getDamageMultiplier(attackType) {
    if (this.immunities.includes(attackType)) {
      return 0;
    } else if (this.weaknesses.includes(attackType)) {
      return 2;
    } else {
      return 1;
    }
  }

  attack() {
    const unitsDead = Math.min(Math.floor(this.defender.effectiveDamage / this.defender.hitPoints), this.defender.count);
    debug(`${this.name} attacks ${this.defender.name}, killing ${unitsDead > this.defender.count ? this.defender.count : unitsDead} units.`);

    this.defender.count -= unitsDead;

    if (this.defender.count > 0 && this.defender.defender) {
      const defender = this.defender.defender;
      defender.effectiveDamage = defender.getDamageMultiplier(this.defender.attackType) * this.defender.effectivePower;
    }

    return unitsDead > 0;
  }
}

class ImmuneSystemGroup extends Group {
  constructor(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities) {
    super(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities, GROUP_TYPE.IMMUNE_SYSTEM);
  }
}

class InfectionGroup extends Group {
  constructor(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities) {
    super(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities, GROUP_TYPE.INFECTION);
  }
}

const trimFunc = i => i.trim();
const parseIntFunc = i => parseInt(i, 10);
const inputLines = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc);

const parseGroup = (type, line, boost = 0) => {
  let [count, remaining01] = line.split('units each with').map(trimFunc);
  count = parseIntFunc(count);

  let [hitPoints, remaining02] = remaining01.split('hit points').map(trimFunc);
  hitPoints = parseIntFunc(hitPoints);

  let weaknesses = [];
  let immunities = [];

  let attackPowerStart = -1;
  if (remaining02.includes('(') && remaining02.includes(')')) {
    const traitsString = remaining02.substring(remaining02.indexOf('(') + 1, remaining02.indexOf(')'));
    let traits = traitsString.split(';');
    traits.forEach(t => {
      const [traitType, attackTypesString] = t.split('to').map(trimFunc);
      const attackTypes = attackTypesString.split(',').map(trimFunc);
      if (traitType === 'weak') {
        weaknesses = attackTypes;
      } else if (traitType === 'immune') {
        immunities = attackTypes;
      }
    });
    attackPowerStart = remaining02.indexOf(')');
  }

  remaining02 = remaining02.substring(attackPowerStart + ' with an attack that does '.length);

  let [attackString, initiative] = remaining02.split('damage at initiative').map(trimFunc);
  let [attackDamage, attackType] = attackString.split(' ').map(trimFunc);
  attackDamage = parseIntFunc(attackDamage) + boost;
  initiative = parseIntFunc(initiative);

  return type === GROUP_TYPE.IMMUNE_SYSTEM ?
    new ImmuneSystemGroup(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities) :
    new InfectionGroup(count, hitPoints, attackType, attackDamage, initiative, weaknesses, immunities);
};

const performFights = function (boost = 0) {
  groupId = 0;
  let immuneSystemGroups = [];
  let infectionGroups = [];

  let immuneSystemStart = 1;
  let infectionStart = immuneSystemStart + groupsCount + 2;
  for (let i = immuneSystemStart; i < immuneSystemStart + groupsCount; i++) {
    immuneSystemGroups.push(parseGroup(GROUP_TYPE.IMMUNE_SYSTEM, inputLines[i], boost));
  }

  for (let i = infectionStart; i < infectionStart + groupsCount; i++) {
    infectionGroups.push(parseGroup(GROUP_TYPE.INFECTION, inputLines[i]));
  }

  let allGroups = immuneSystemGroups.concat(infectionGroups);

  const sortById = (a, b) => a.id - b.id;
  const sortByInitiative = (a, b) => {
    return b.initiative - a.initiative;
  };
  const sortByEffectivePowerAndInitiative = (a, b) => {
    if (a.effectivePower === b.effectivePower) {
      return sortByInitiative(a, b);
    }

    return b.effectivePower - a.effectivePower;
  };

  // allGroups.slice().sort(sortById).forEach(g => debug(g));

  // fight
  let fightCounter = 0;
  let hadKills = true;
  while (
    immuneSystemGroups.some(g => g.count > 0) &&
    infectionGroups.some(g => g.count > 0) &&
    hadKills) {

    debug(`\nfight turn #${++fightCounter}`);

    hadKills = false;

    immuneSystemGroups = immuneSystemGroups.filter(g => g.count > 0);
    infectionGroups = infectionGroups.filter(g => g.count > 0);
    allGroups = immuneSystemGroups.concat(infectionGroups);

    allGroups
      .slice()
      .sort(sortById)
      .filter(g => g.count > 0)
      .forEach(g => {
        debug(`${g.name} contains ${g.count} units`)
      });

    allGroups.forEach(g => {
      g.attacker = null;
      g.defender = null;
      g.effectiveDamage = 0;
    });

    debug();

    // target selection
    let idx = 0;
    while (true) {
      const attacker = allGroups
        .filter(e => e.count > 0)
        .sort(sortByEffectivePowerAndInitiative)[idx++];

      if (!attacker) {
        break;
      }

      const defenders = (attacker.type === GROUP_TYPE.IMMUNE_SYSTEM ? infectionGroups : immuneSystemGroups)
        .filter(e => e.attacker === null)
        .map(e => {
          e.effectiveDamage = e.getDamageMultiplier(attacker.attackType) * attacker.effectivePower;
          return e;
        })
        .filter(e => e.effectiveDamage > 0 && e.count > 0)
        .sort((a, b) => {
          if (a.effectiveDamage === b.effectiveDamage) {
            return sortByEffectivePowerAndInitiative(a, b);
          }

          return b.effectiveDamage - a.effectiveDamage;
        });

      // defenders.slice().filter(g => g.count > 0).sort(sortById).forEach(e => {
      //   debug(`${attacker.name} would deal ${e.name} ${e.effectiveDamage} damage`);
      // });
      //
      const defender = defenders[0];

      if (!defender) {
        continue;
      }

      attacker.defender = defender;
      defender.attacker = attacker;
    }

    debug();
    allGroups
      .slice()
      .sort(sortById)
      .filter(g => g.count > 0)
      .forEach(g => {
        debug(`${g}`)
      });
    debug();

    // attack
    idx = 0;
    const attackers = allGroups
      .filter(g => g.count > 0)
      .sort(sortByInitiative);

    while (true) {
      const attacker = attackers[idx++];

      if (!attacker) {
        break;
      }

      if (attacker.defender == null || attacker.defender.count === 0) {
        continue;
      }

      let attackHadKills = attacker.attack();

      hadKills = hadKills || attackHadKills;
    }
  }

  return allGroups;
};

let allGroups;
// part 01
allGroups = performFights();

let part01Answer = allGroups.reduce((p, c) => p + c.count, 0);
console.log(`part 01 answer: ${part01Answer}`);

// part 02
let part02Answer;
let boost = 1;
while (true) {
  allGroups = performFights(boost);
  part02Answer = allGroups.reduce((p, c) => p + c.count, 0);

  if (allGroups.filter(g => g.type === GROUP_TYPE.INFECTION).every(g => g.count === 0)) {
    break;
  }

  boost++;
  debug(`changing boost to ${boost}`);
}

console.log(`part 02 answer: ${part02Answer}`);
