const R = require('ramda');
const Db = require('../util/db');
const Blocks = require('./blocks');
const Block = require('./block');
const Transactions = require('./transactions');
// Database settings
const BLOCKCHAIN_FILE = 'blocks.json';
const TRANSACTIONS_FILE = 'transactions.json';
class Blockchain {
    constructor(dbName) {
        this.blocksDb = new Db('data/' + dbName + '/' + BLOCKCHAIN_FILE, new Blocks());

        // INFO: In this implementation the database is a file and every time data is saved it rewrites the file, probably it should be a more robust database for performance reasons
        this.blocks = this.blocksDb.read(Blocks);

        //pending transaction pool
        this.transactionsDb = new Db('data/' + dbName + '/' + TRANSACTIONS_FILE, new Transactions());
        this.transactions = this.transactionsDb.read(Transactions);

        this.init();
    }

    init() {
        // Create the genesis block if the blockchain is empty
        if (this.blocks.length == 0) {
            console.info('Blockchain empty, adding genesis block');
            this.blocks.push(new Block(0, 0, 0, "data: genesis", 0));
            this.blocksDb.write(this.blocks);
        }
    }

    addBlock(newBlock) {
        if (this.checkBlock(newBlock, this.getLastBlock())) {
            this.blocks.push(newBlock);
            this.blocksDb.write(this.blocks);
            // After adding the block it removes the transactions of this block from the list of pending transactions
            console.log("length of transactions", this.transactions.length)
            this.removeBlockTransactionsFromTransactions(newBlock);
            console.log("length of transactions", this.transactions.length)
            console.info("Remove all pending transactions")

            console.info(`Block added: ${newBlock.hash}`);
            console.debug(`Block added: ${JSON.stringify(newBlock)}`);
            return newBlock;
        }
    }
    removeBlockTransactionsFromTransactions(newBlock) {
        for (let i = 0; i < this.transactions.length; i++) {
            const transaction = this.transactions[i];
            if (newBlock.transactions.some(newTransaction => newTransaction.id === transaction.id)) {
              this.transactions.splice(i, 1);
              i--;
            }
        }
        this.transactionsDb.write(this.transactions);
    }

    addTransaction(newTransaction) {

        this.transactions.push(newTransaction);
        this.transactionsDb.write(this.transactions);

        console.info(`Transaction added: ${newTransaction.id}`);
        console.debug(`Transaction added: ${JSON.stringify(newTransaction)}`);
    }

    getLastBlock() {
        return R.last(this.blocks);
    }
    getDifficulty(index) {
        // Proof-of-work difficulty settings
        const BASE_DIFFICULTY = Number.MAX_SAFE_INTEGER;
        const EVERY_X_BLOCKS = 5;
        const POW_CURVE = 5;

        // INFO: The difficulty is the formula that naivecoin choose to check the proof a work, this number is later converted to base 16 to represent the minimal initial hash expected value.
        // INFO: This could be a formula based on time. Eg.: Check how long it took to mine X blocks over a period of time and then decrease/increase the difficulty based on that. See https://en.bitcoin.it/wiki/Difficulty
        return Math.max(
            Math.floor(
                BASE_DIFFICULTY / Math.pow(
                    Math.floor(((index || this.blocks.length) + 1) / EVERY_X_BLOCKS) + 1
                    , POW_CURVE)
            )
            , 0);
    }
    checkBlock(newBlock, previousBlock) {
        const blockHash = newBlock.toHash();
        console.log("previousBlock.index", previousBlock.index);

        if (previousBlock.index + 1 !== newBlock.index) { // Check if the block is the last one
            console.error(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
            throw new BlockAssertionError(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
        } else if (previousBlock.hash !== newBlock.previousHash) { // Check if the previous block is correct
            console.error(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
            throw new BlockAssertionError(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
        } else if (blockHash !== newBlock.hash) { // Check if the hash is correct
            console.error(`Invalid hash: expected '${blockHash}' got '${newBlock.hash}'`);
            throw new BlockAssertionError(`Invalid hash: expected '${blockHash}' got '${newBlock.hash}'`);
        } else if (newBlock.getDifficulty() >= this.getDifficulty(newBlock.index)) { // If the difficulty level of the proof-of-work challenge is correct
            console.error(`Invalid proof-of-work difficulty: expected '${newBlock.getDifficulty()}' to be smaller than '${this.getDifficulty(newBlock.index)}'`);
            throw new BlockAssertionError(`Invalid proof-of-work difficulty: expected '${newBlock.getDifficulty()}' be smaller than '${this.getDifficulty()}'`);
        }
        return true;
    }

}

module.exports = Blockchain;
