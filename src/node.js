const Blockchain = require('./blockchain');

class Node {
    constructor(blockchain) {
        this.blockchain = blockchain;
    }
    checkReceivedBlocks(block) {
        const latestBlockHeld = this.blockchain.getLastBlock();
        if (latestBlockHeld.hash === block.previousHash) { // We can append the received block to our chain
            console.info('Appending received block to our chain');
            this.blockchain.addBlock(block);
            return true;
        }
        console.info('Fail to append received block to our chain');
        return false;
    }
}
module.exports = Node;