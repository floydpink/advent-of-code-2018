const fs = require('fs');

let inputPath = 'input.txt';

class Marble {
  constructor(number) {
    this.number = number;
  }

  toString() {
    return `M[${this.number}]`;
  }
}

class Player {
  constructor(id) {
    this.id = id;
    this.score = 0;
  }

  addToScore(score) {
    this.score += score;
  }
}

class Game {
  constructor(playersCount, lastMarbleScore, highScore) {
    this.playersCount = playersCount;
    this.lastMarbleScore = lastMarbleScore;
    this.highScore = !!highScore ? highScore : 0;

    const initialMarble = new Marble(0);
    this.circle = [initialMarble];
    this.currentMarbleIdx = 1;
  }

  play(marble) {
    if ((marble.number % 23) === 0) {
      let sevenBeforeIdx = this.currentMarbleIdx - 7;
      // console.log(`idx: ${sevenBeforeIdx}`);

      if (sevenBeforeIdx < 0) {
        sevenBeforeIdx = this.circle.length + sevenBeforeIdx;
      }

      let score = marble.number + this.circle[sevenBeforeIdx].number;

      this.circle.splice(sevenBeforeIdx, 1);
      this.currentMarbleIdx = sevenBeforeIdx;

      return {scored : true, score};
    }

    let oneAfterIdx = this.circle.length;
    const oneAfterIdxRem = (this.currentMarbleIdx + 1) % this.circle.length;
    if (oneAfterIdxRem !== 0) {
      oneAfterIdx = oneAfterIdxRem;
    }

    let twoAfterIdx = this.circle.length;
    const twoAfterIdxRem = (this.currentMarbleIdx + 2) % this.circle.length;
    if (twoAfterIdxRem !== 0) {
      twoAfterIdx = twoAfterIdxRem;
    }

    this.circle.splice(twoAfterIdx, 0, marble);
    this.currentMarbleIdx = twoAfterIdx;

    // console.log(`current marble: ${this.currentMarble}`);

    return {scored : false, score : 0};
  }
}

class PlayerGenerator {
  constructor(playersCount) {
    this.playersCount = playersCount;

    this.playersMap = new Map();
    this.nextPlayerId = 0;
    this.setNextPlayer();
  }

  setNextPlayer() {
    this.nextPlayerId = (this.nextPlayerId + 1) % this.playersCount;
    if (!this.playersMap.has(this.nextPlayerId)) {
      this.playersMap.set(this.nextPlayerId, new Player(this.nextPlayerId));
    }
    this._nextPlayer = this.playersMap.get(this.nextPlayerId);
  }

  get nextPlayer() {
    let player = this._nextPlayer;
    this.setNextPlayer();
    return player;
  }
}

const parseIntFunc = part => parseInt(part, 10);
const trimFunc = part => part.trim();
const parseInput = line => {
  let [playersCount, lastMarbleScore, highScore] = line.split(' ')
    .map(trimFunc)
    .filter((p, idx) => idx === 6 || idx === 0 || idx === 11)
    .map(parseIntFunc);
  return new Game(playersCount, lastMarbleScore, highScore);
};

const games = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(parseInput);

// console.log(games.length);
// console.log(JSON.stringify(games, null, 2));

let gameCounter = 1;
let partCounter = 1;
for (let game of games) {
  const playerGenerator = new PlayerGenerator(game.playersCount);

  for (let m = 1; m <= game.lastMarbleScore; m++) {
    const player = playerGenerator.nextPlayer;
    const result = game.play(new Marble(m));
    if (result.scored) {
      player.addToScore(result.score);
    }
    if (m % 10000 === 0) {
      console.log(`Processed ${m} marbles...`);
    }
  }

  const players = Array.from(playerGenerator.playersMap.values());
  // console.log(players.length);
  const highScore = Math.max.apply(null, players.map(p => p.score));

  if (!!game.highScore) {
    if (highScore === game.highScore) {
      console.log(`algorithm correct for game #${gameCounter++}`);
    } else {
      console.log(`!! algorithm incorrect for game #${gameCounter++}: game.highScore: ${game.highScore} && highScore: ${highScore}`);
    }
  } else {
    console.log(`part 0${partCounter++} answer: ${highScore} (${game.playersCount})`);
  }
}

// the part 02 answer took 6h 38m 32s !!!