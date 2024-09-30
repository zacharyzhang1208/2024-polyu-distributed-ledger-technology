const Blockchain = require('./blockchain');
const Miner = require('./miner');
const Node = require('./node')
const name = 'naivechain_5521';
const Transaction = require('./transaction');
const CryptoUtil = require('../util/cryptoUtil');


let blockchain = new Blockchain(name);
let miner = new Miner(blockchain);
let node = new Node(blockchain);

//miner generate a address
miner.generateAddress();

blockchain.addTransaction(Transaction.fromJson({
    id: CryptoUtil.randomId(64),
    hash: null,
    type: 'course',
    data: 'comp5521',
}));
let newblock = miner.mine();

node.checkReceivedBlocks(newblock)


blockchain.addTransaction(Transaction.fromJson({
    id: CryptoUtil.randomId(64),
    hash: null,
    type: 'course',
    data: 'comp6701',
}));
newblock = miner.mine();

node.checkReceivedBlocks(newblock)

blockchain.addTransaction(Transaction.fromJson({
    id: CryptoUtil.randomId(64),
    hash: null,
    type: 'course',
    data: 'comp6702',
}));
newblock = miner.mine();
node.checkReceivedBlocks(newblock)



console.log(JSON.stringify(blockchain.blocks, null, 4));