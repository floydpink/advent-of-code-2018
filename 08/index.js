const fs = require('fs');

const rawArray = fs.readFileSync('input.txt')
  .toString()
  .split(' ')
  .map(i => parseInt(i, 10));

class Node {
  constructor(id, childrenCount, metadataCount) {
    this.id = id;
    this.childrenCount = childrenCount;
    this.metadataCount = metadataCount;

    this.children = [];
    this.metadata = [];
  }

  addChild(node) {
    this.children.push(node);
  }

  addMetadata(metadata) {
    this.metadata.push(metadata);
  }

  get val() {
    if (this.children.length === 0) {
      return this.metadata.reduce((p, c) => p + c);
    }

    let val = 0;
    for (let metadata of this.metadata) {
      let childNodeByMetadata = this.children[metadata - 1];
      if (childNodeByMetadata) {
        val += childNodeByMetadata.val;
      }
    }

    return val;
  }
}


let idx = 0;
let metadataSum = 0;
let nodeIndexLimit = rawArray.length - 1;

const readMetadata = function(node, metadataCount) {
  for (let i = 0; i < metadataCount; i++) {
    const metadata = rawArray[idx++];
    node.addMetadata(metadata);
    metadataSum += metadata;
  }
  nodeIndexLimit += metadataCount;
};

const nodeStack = [];

let nodeId = 0;
const superRoot = new Node(nodeId++, 1, 0);
let parentNode = superRoot;

while (idx < rawArray.length) {
  if (idx <= nodeIndexLimit && parentNode.childrenCount > parentNode.children.length) {
    let childrenCount = rawArray[idx++];
    let metadataCount = rawArray[idx++];

    nodeIndexLimit -= metadataCount;

    let node = new Node(nodeId++, childrenCount, metadataCount);
    parentNode.addChild(node);

    if (childrenCount === 0) {
      readMetadata(node, metadataCount);
    } else {
      nodeStack.push(node);
      parentNode = node;
    }
  } else {
    let node = nodeStack.pop();
    readMetadata(node, node.metadataCount);
    parentNode = nodeStack[nodeStack.length - 1];
  }
}

// console.log(JSON.stringify(superRoot, null, 2));
console.log(`part 01 answer: ${metadataSum}`);

const rootNode = superRoot.children[0];
console.log(`part 02 answer: ${rootNode.val}`);
