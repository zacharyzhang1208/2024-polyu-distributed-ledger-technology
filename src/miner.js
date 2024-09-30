const Block = require("./block");
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');
class Miner {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.keyPair = null;
    }
    generateAddress() {
        let seed = 1;
        let keyPairRaw = CryptoEdDSAUtil.generateKeyPairFromSecret(seed);
        console.log(CryptoEdDSAUtil.toHex(keyPairRaw.getPublic()));
        let newKeyPair = {
            secretKey: CryptoEdDSAUtil.toHex(keyPairRaw.getSecret()),
            publicKey: CryptoEdDSAUtil.toHex(keyPairRaw.getPublic())
        };
        this.keyPair = newKeyPair;
        console.log("Successful generate the keypair, the public key is  ", this.keyPair.publicKey);
    }
    mine() {
        //use the publicKey as address
        let baseBlock = Miner.generateNextBlock(this.keyPair.publicKey, this.blockchain);

        return baseBlock;
    }
    static generateNextBlock(rewardAddress, blockchain) {
        const previousBlock = blockchain.getLastBlock();
        const index = previousBlock.index + 1;
        const previousHash = previousBlock.hash;
        const timestamp = new Date().getTime() / 1000;
        const nonce = 0;
        const transactions = JSON.parse(JSON.stringify(blockchain.transactions));

        console.log("rewardAddress is ", rewardAddress);
        // Add reward transaction of 50 coins
        if (rewardAddress != null) {
            let rewardTransaction = Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: 'reward',
                data: {
                    inputs: [],
                    outputs: [
                        {
                            amount: 50, // 
                            address: rewardAddress, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's a simple destination address 
                        }
                    ]
                }
            });

            transactions.push(rewardTransaction);
        }

        let newBlock = new Block(index, timestamp, nonce, transactions, previousHash);
        let block = Miner.proveWorkFor(newBlock, blockchain.getDifficulty(index));
        return block;
    }
    /* istanbul ignore next */
    static proveWorkFor(block, difficulty) {
        let blockDifficulty = null;
        let start = process.hrtime();

        // INFO: Every cryptocurrency has a different way to prove work, this is a simple hash sequence

        // Loop incrementing the nonce to find the hash at desired difficulty
        do {
            block.nonce++;
            block.hash = block.toHash();
            blockDifficulty = block.getDifficulty();
        } while (blockDifficulty >= difficulty);
        console.info(`Block found: time '${process.hrtime(start)[0]} sec' dif '${difficulty}' hash '${block.hash}' nonce '${block.nonce}'`);
        return block;
    }
}

module.exports = Miner;
