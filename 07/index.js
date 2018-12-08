const fs = require('fs');

let inputPath = 'input.txt';
const BASELINE_SECONDS = inputPath === 'input.txt' ? 60 : 0;
const WORKERS_COUNT = inputPath === 'input.txt' ? 5 : 2;

class Step {
  constructor(name) {
    this.name = name;
    this.map = new Map();
    this.children = new Set();
    this.dependencies = 0;
    this.processing = false;
    this.processed = false;
  }

  get stepDuration() {
    return this.name.toLocaleLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1 + BASELINE_SECONDS;
  }

  toString() {
    return `${this.name}${this.dependencies}${this.processing ? '*' : ' '}`;
  }

  addDependent(node) {
    if (!this.map.has(node.name)) {
      this.children.add(node);
      this.map.set(node.name, node);
      node.incrementDeps();
    }
  }

  incrementDeps() {
    this.dependencies = this.dependencies + 1;
  }

  decrementDeps() {
    this.dependencies = this.dependencies - 1;
  }
}

class Graph {
  constructor() {
    this.nodes = []; // Steps
    this.map = new Map();
  }

  getOrCreateStep(step) {
    if (!this.map.has(step)) {
      let node = new Step(step);
      this.nodes.push(node);
      this.map.set(step, node);
    }

    return this.map.get(step);
  }

  addEdge(start, end) {
    let startNode = this.getOrCreateStep(start);
    let endNode = this.getOrCreateStep(end);
    endNode.addDependent(startNode)
  }

  get orderedNodes() {
    return this.nodes
      .filter(s => !s.processed)
      .sort((a, b) => {
        if (a.dependencies === b.dependencies) {
          if (a.processing === b.processing) {
            return a.name > b.name ? 1 : -1;
          }

          return a.processing ? 1 : -1;
        }

        return a.dependencies - b.dependencies;
      });
  }
}

class Worker {
  constructor(id) {
    this.id = id;
    this.busy = 0;
  }

  toString() {
    return `[${this.id}:${this.busy && this.step ? this.step.name : '*'}]`;
  }

  startStep(step) {
    step.processing = true;
    this.busy = step.stepDuration;
    this.step = step;
  }

  elapseSecond(elapsed) {
    this.busy = this.busy - 1;

    if (this.busy < 0) {
      this.step = null;
    }

    if (this.step != null && !this.isBusy) {
      this.step.processed = true;
    }

    // console.log(`${this}`);

    return this.step;
  }

  get isBusy() {
    return this.busy > 0;
  }
}

const trimFunc = part => part.trim();
const instructionStepEdges = fs.readFileSync(inputPath)
  .toString()
  .split('\n')
  .map(trimFunc)
  .map(step => {
    let [a, end, b, c, d, e, f, start, g, h] = step.split(' ');
    return [start, end];
  });

// console.log(`steps count: ${instructionStepEdges.length}`);
// console.log(`steps: ${JSON.stringify(instructionStepEdges)}`);

const buildGraph = function () {
  let graph = new Graph();
  for (let edge of instructionStepEdges) {
    for (let step of edge) {
      graph.getOrCreateStep(step);
    }

    graph.addEdge(edge[0], edge[1]);
  }
  return graph;
};

// part 01

let graph = buildGraph();
// console.log(`steps count: ${graph.nodes.length}`);
// for (let step of graph.orderedNodes) {
// console.log(`step: ${step}, children: ${Array.from(step.children)}`);
// }

let stepsInOrder = [];
while (graph.orderedNodes.length > 0) {
  // console.log(stepsInOrder.length, graph.orderedNodes.map(s => `${s.name}-${s.dependencies}`));
  let current = graph.orderedNodes[0];
  stepsInOrder.push(current.name);

  current.processed = true;
  for (let child of current.children) {
    // console.log(`current: ${current}, child: ${child}`);
    child.decrementDeps();
  }
}

let part01answer = stepsInOrder.join('');
console.log(`part 01 answer: ${part01answer}`);

// part 02
graph = buildGraph();
stepsInOrder = [];

let elapsedSeconds = 0;
let workers = [];
for (let i = 0; i < WORKERS_COUNT; i++) {
  workers.push(new Worker(i + 1));
}

while (stepsInOrder.length < part01answer.length) {
  /*
    console.log(elapsedSeconds,
      stepsInOrder.length,
      workers.map(w => w.toString()),
      graph.orderedNodes.map(s => `${s.name}-${s.dependencies}`));
  */

  for (let worker of workers.sort((a, b) => a.busy - b.busy)) {
    if (!worker.isBusy) {
      let next = graph.orderedNodes[0];
      if (next && !next.dependencies) {
        if (!next.processing) {
          // console.log(elapsedSeconds, `worker ${worker} starting on ${next}`);
          worker.startStep(next);
        }
      } else if (next && next.dependencies) {
        break;
      }
    }
  }

  // console.log(elapsedSeconds, workers.sort((a, b) => a.id - b.id).map(w => w.toString()), graph.orderedNodes.slice(0, 5).map(s => `${s}`), stepsInOrder.join(''));

  elapsedSeconds++;
  for (let worker of workers) {
    let workersStep = worker.elapseSecond(elapsedSeconds);
    if (!!workersStep && workersStep.processed) {
      // console.log(elapsedSeconds, `worker ${worker} completed ${workersStep}`);
      stepsInOrder.push(workersStep.name);
      for (let child of workersStep.children) {
        child.decrementDeps();
      }
    }
  }
}

// console.log(elapsedSeconds, workers.sort((a, b) => a.id - b.id).map(w => w.toString()), graph.orderedNodes.slice(0, 5).map(s => `${s}`), stepsInOrder.join(''));

// console.log(stepsInOrder.join(''));
console.log(`part 02 answer: ${elapsedSeconds}`);
