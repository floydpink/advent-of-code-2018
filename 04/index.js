const fs = require('fs');

const parseIntFunc = part => parseInt(part, 10);
const trimFunc = part => part.trim();
const parseDate = function (dateString) {
  let [date, time] = dateString.split(' ').map(trimFunc);
  let [year, month, day] = date.split('-').map(trimFunc).map(parseIntFunc);
  let [hour, min] = time.split(':').map(trimFunc).map(parseIntFunc);
  let date1 = new Date(Date.UTC(year, month - 1, day, hour, min));
  // console.log(dateString, date1);
  return {date : date1, hour, min};
};
const LOG_ENTRY = {
  START_SHIFT : 0,
  FALL_ASLEEP : 1,
  WAKE_UP     : 2
};
let guardId = null;
const parseLog = function (log) {
  let entry = null;
  if (log === 'wakes up') {
    entry = LOG_ENTRY.WAKE_UP;
  } else if (log === 'falls asleep') {
    entry = LOG_ENTRY.FALL_ASLEEP;
  } else if (log.includes('Guard #')) {
    entry = LOG_ENTRY.START_SHIFT;
    [_, id, _, _] = log.split(' ').map(trimFunc);
    guardId = parseInt(id.substring(1), 10);
  }
  return {guardId, entry};
};
const inputLogs = fs.readFileSync('input.txt')
  .toString()
  .split('\n');

let counter = 0;
const logEntries = inputLogs
  .map(line => {
    let [time, log] = line.split(']').map(trimFunc);
    let date = parseDate(time.substring(1));
    return {date : date.date, hour : date.hour, min : date.min, log};
  })
  .sort((a, b) => a.date - b.date)
  .map(l => {
    let {guardId, entry} = parseLog(l.log);
    return {id : counter++, date : l.date, hour : l.hour, min : l.min, guardId, entry};
  });

console.log(`inputLogs count: ${inputLogs.length}`);
console.log(`logEntries count: ${logEntries.length}`);
// console.log(`inputLogs: ${JSON.stringify(logEntries, null, 2)}`);

fs.writeFileSync('parsed.txt', JSON.stringify(logEntries, null, 2));

let guardMinutesAsleepMap = new Map();
const uniqueGuardIds = [...new Set(logEntries.map(le => le.guardId))].sort((a, b) => a - b);
for (let gId of uniqueGuardIds) {
  guardMinutesAsleepMap.set(gId, 0);
}

console.log(`Unique Guards count: ${uniqueGuardIds.length}`);
console.log('');

let prevGuardId = null;
let startSleepMinute = null;
for (let logEntry of logEntries) {
  if (logEntry.entry === LOG_ENTRY.START_SHIFT) {
    prevGuardId = logEntry.guardId;
    startSleepMinute = null;
  } else if (logEntry.entry === LOG_ENTRY.FALL_ASLEEP) {
    startSleepMinute = logEntry.min;
  } else if (logEntry.entry === LOG_ENTRY.WAKE_UP) {
    let sleepDuration = (logEntry.min - startSleepMinute);
    if (sleepDuration < 0) {
      console.log(`Invalid sleep duration for guardId '${prevGuardId}!' at ${logEntry.id}`, startSleepMinute, logEntry.min);
    }
    guardMinutesAsleepMap.set(logEntry.guardId, guardMinutesAsleepMap.get(logEntry.guardId) + sleepDuration);
    startSleepMinute = null;
  }
}

let maxMinutesForAnyGuard = Number.MIN_SAFE_INTEGER;
let sleepiestGuard = null;
for (let guardMinutesAsleep of guardMinutesAsleepMap) {
  maxMinutesForAnyGuard = Math.max(maxMinutesForAnyGuard, guardMinutesAsleep[1]);
  if (maxMinutesForAnyGuard === guardMinutesAsleep[1]) {
    sleepiestGuard = guardMinutesAsleep[0];
  }
}

console.log(`maxMinutesForAnyGuard: ${maxMinutesForAnyGuard}`);
console.log(`sleepiestGuard: ${sleepiestGuard}`);

let sleepyGuardsLogs = logEntries.filter(l => l.guardId === sleepiestGuard);
let sleepyGuardMinutesSleptMap = new Map();
for (let i = 0; i < 60; i++) {
  sleepyGuardMinutesSleptMap.set(i, 0);
}

for (let logEntry of sleepyGuardsLogs) {
  if (logEntry.entry === LOG_ENTRY.START_SHIFT) {
    startSleepMinute = null;
  } else if (logEntry.entry === LOG_ENTRY.FALL_ASLEEP) {
    startSleepMinute = logEntry.min;
  } else if (logEntry.entry === LOG_ENTRY.WAKE_UP) {
    for (let j = startSleepMinute; j < logEntry.min; j++) {
      sleepyGuardMinutesSleptMap.set(j, sleepyGuardMinutesSleptMap.get(j) + 1);
    }
    startSleepMinute = null;
  }
}

let sleepiestGuardsSleepiestMinute = Number.MIN_SAFE_INTEGER;
let sleepiestMinute = null;
for (let sleepyGuardsMinuteSlept of sleepyGuardMinutesSleptMap) {
  sleepiestGuardsSleepiestMinute = Math.max(sleepiestGuardsSleepiestMinute, sleepyGuardsMinuteSlept[1]);
  if (sleepiestGuardsSleepiestMinute === sleepyGuardsMinuteSlept[1]) {
    sleepiestMinute = sleepyGuardsMinuteSlept[0];
  }
}

console.log(`sleepiestGuardsSleepiestMinute: ${sleepiestGuardsSleepiestMinute}`);
console.log(`sleepiestMinute: ${sleepiestMinute}`);

let part01Answer = sleepiestGuard * sleepiestMinute;
console.log(`part01Answer (sleepiestGuard * sleepiestMinute): ${part01Answer}`);
console.log('');

let mostAsleepMinuteMap = {};
for (let i = 0; i < 60; i++) {
  mostAsleepMinuteMap[i] = 0;
}

let guardMostAsleepMinuteMap = new Map();
for (let guardId of uniqueGuardIds) {
  guardMostAsleepMinuteMap.set(guardId, Object.assign({}, mostAsleepMinuteMap));
}

prevGuardId = null;
for (let logEntry of logEntries) {
  if (logEntry.entry === LOG_ENTRY.START_SHIFT) {
    prevGuardId = logEntry.guardId;
    startSleepMinute = null;
  } else if (logEntry.entry === LOG_ENTRY.FALL_ASLEEP) {
    startSleepMinute = logEntry.min;
  } else if (logEntry.entry === LOG_ENTRY.WAKE_UP) {
    let guardStat = guardMostAsleepMinuteMap.get(prevGuardId);
    for (let j = startSleepMinute; j < logEntry.min; j++) {
      guardStat[j] = guardStat[j] + 1;
    }
    guardMostAsleepMinuteMap.set(prevGuardId, guardStat);
    startSleepMinute = null;
  }
}

let largestNumberForAnyMinuteForAnyGuard = Number.MIN_SAFE_INTEGER;
let largestSleepingMinute = null;
let guardWithLargestSleepingMinute = null;
for (let guardStat of guardMostAsleepMinuteMap) {
  let guardId = guardStat[0];
  let minuteStats = guardStat[1];
  for (let minute of Object.entries(minuteStats)) {
    largestNumberForAnyMinuteForAnyGuard = Math.max(largestNumberForAnyMinuteForAnyGuard, minute[1]);
    if (largestNumberForAnyMinuteForAnyGuard === minute[1]) {
      largestSleepingMinute = minute[0];
      guardWithLargestSleepingMinute = guardId;
    }
  }
}

console.log(`largestSleepingMinute: ${largestSleepingMinute}`);
console.log(`guardWithLargestSleepingMinute: ${guardWithLargestSleepingMinute}`);
console.log(`largestNumberForAnyMinuteForAnyGuard: ${largestNumberForAnyMinuteForAnyGuard}`);

let part02Answer = largestSleepingMinute * guardWithLargestSleepingMinute;
console.log(`part02Answer (largestSleepingMinute * guardWithLargestSleepingMinute): ${part02Answer}`);
