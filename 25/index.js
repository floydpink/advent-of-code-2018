const fs = require('fs');

let inputPath = 'input.txt';

let trimFunc = i => i.trim();
let parseIntFunc = i => parseInt(i, 10);
const stars = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc)
  .map((line, id) => {
    const [a, b, c, d] = line.split(',').map(trimFunc).map(parseIntFunc);
    return {id, a, b, c, d};
  });

// console.log(stars.length);
// console.log(stars);

const distance = function (x, y) {
  return Math.abs(x.a - y.a) + Math.abs(x.b - y.b) + Math.abs(x.c - y.c) + Math.abs(x.d - y.d);
};

const starPairs = new Set();
const starConstellationMap = new Map();
let constellationId = 0;

const addOrMergeExistingConstellation = function (s1, s2) {
  const c = starConstellationMap.get(s1.id);
  c.stars.add(s2);

  if (starConstellationMap.has(s2.id)) {
    const cToMerge = starConstellationMap.get(s2.id);

    for (let s of cToMerge.stars) {
      starConstellationMap.delete(s.id);
      c.stars.add(s);
      starConstellationMap.set(s.id, c);
    }

  } else {
    starConstellationMap.set(s2.id, c);
  }
};

for (let i = 0; i < stars.length; i++) {
  for (let j = 0; j < stars.length; j++) {
    if (i === j) continue;

    let star1 = stars[i];
    let star2 = stars[j];
    if (starPairs.has(`${star1.id}|${star2.id}`)) {
      continue;
    }
    if (starPairs.has(`${star2.id}|${star1.id}`)) {
      continue;
    }

    const d = distance(star1, star2);

    if (d <= 3) {
      if (starConstellationMap.has(star1.id)) {
        addOrMergeExistingConstellation(star1, star2);
      } else if (starConstellationMap.has(star2.id)) {
        addOrMergeExistingConstellation(star2, star1);
      } else {
        const c = {id : constellationId++, stars : new Set([star1, star2])};
        starConstellationMap.set(star1.id, c);
        starConstellationMap.set(star2.id, c);
      }
    } else {
      if (!starConstellationMap.has(star1.id)) {
        const c = {id : constellationId++, stars : new Set([star1])};
        starConstellationMap.set(star1.id, c);
      } else if (!starConstellationMap.has(star2.id)) {
        const c = {id : constellationId++, stars : new Set([star2])};
        starConstellationMap.set(star2.id, c);
      }
    }

    starPairs.add(`${star1.id}|${star2.id}`);
    starPairs.add(`${star2.id}|${star1.id}`);
  }
}

const constellations = [...new Set(starConstellationMap.values())];
console.log(`part 01 answer: ${constellations.length}`);