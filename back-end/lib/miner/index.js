const R = require('ramda');
const spawn = require('threads').spawn;
const Block = require('../blockchain/block');
const CryptoUtil = require('../util/cryptoUtil');
const Transaction = require('../blockchain/transaction');
const Config = require('../config');

class Miner {
    constructor(blockchain, logLevel) {
        this.blockchain = blockchain;
        this.logLevel = logLevel;
    }

    mine(rewardAddress, feeAddress) {
        let baseBlock = Miner.generateNextBlock(rewardAddress, feeAddress, this.blockchain);
        //移除了包含'debug'的参数，避免调试模式影响子进程
        process.execArgv = R.reject((item) => item.includes('debug'), process.execArgv);

       //建新的工作线程来执行挖矿计算
        //input：通过thread.send()传入的数据对象
        //done：回调函数，用于返回计算结果
        const thread = spawn(function (input, done) {
            /*eslint-disable */
            require(input.__dirname + '/../util/consoleWrapper.js')('mine-worker', input.logLevel);
            const Block = require(input.__dirname + '/../blockchain/block');
            const Miner = require(input.__dirname);
            /*eslint-enable */

            done(Miner.proveWorkFor(Block.fromJson(input.jsonBlock), input.difficulty));
        });
        //前一个函数的输出作为后一个函数的输入
        //统计交易类型的数量并格式化输出
        //例如：输入[{type:'reward'}, {type:'fee'}, {type:'regular'}]
        //输出可能是：reward: 1, fee: 1, regular: 1

        const transactionList = R.pipe(
            R.countBy(R.prop('type')),
            R.toString,
            R.replace('{', ''),
            R.replace('}', ''),
            R.replace(/"/g, '')
        )(baseBlock.transactions);

        console.info(`Mining a new block with ${baseBlock.transactions.length} (${transactionList}) transactions`);
        //thread.promise()返回一个Promise对象，当子线程完成时，调用then()方法处理结果
        const promise = thread.promise().then((result) => {
            thread.kill();
            return result;
        });
        //thread.send()方法将数据对象发送给子线程
        thread.send({
            __dirname: __dirname,
            logLevel: this.logLevel,
            jsonBlock: baseBlock,
            difficulty: this.blockchain.getDifficulty()
        });

        return promise;
    }

    static generateNextBlock(rewardAddress, feeAddress, blockchain) {
        const previousBlock = blockchain.getLastBlock();
        const index = previousBlock.index + 1;
        const previousHash = previousBlock.hash;
        const timestamp = new Date().getTime() / 1000;
        const currentDifficulty = blockchain.getDifficulty();
        const blocks = blockchain.getAllBlocks();
        const candidateTransactions = blockchain.transactions;
        const transactionsInBlocks = R.flatten(R.map(R.prop('transactions'), blocks));
        const inputTransactionsInTransaction = R.compose(R.flatten, R.map(R.compose(R.prop('inputs'), R.prop('data'))));

        // console.log('待处理交易:', candidateTransactions.map(tx => ({
        //     id: tx.id,
        //     type: tx.type,
        //     metadata: tx.metadata
        // })));

        // Select transactions that can be mined         
        let rejectedTransactions = [];
        let selectedTransactions = [];
        R.forEach((transaction) => {
            let negativeOutputsFound = 0;
            let i = 0;
            let outputsLen = transaction.data.outputs.length;

            // Check for negative outputs (avoiding negative transactions or 'stealing')
            for (i = 0; i < outputsLen; i++) {
                if (transaction.data.outputs[i].amount < 0) {
                    negativeOutputsFound++;
                }
            }
            // Check if any of the inputs is found in the selectedTransactions or in the blockchain
            let transactionInputFoundAnywhere = R.map((input) => {
                let findInputTransactionInTransactionList = R.find(
                    R.whereEq({
                        'transaction': input.transaction,
                        'index': input.index
                    }));

                // Find the candidate transaction in the selected transaction list (avoiding double spending)
                let wasItFoundInSelectedTransactions = R.not(R.isNil(findInputTransactionInTransactionList(inputTransactionsInTransaction(selectedTransactions))));

                // Find the candidate transaction in the blockchain (avoiding mining invalid transactions)
                let wasItFoundInBlocks = R.not(R.isNil(findInputTransactionInTransactionList(inputTransactionsInTransaction(transactionsInBlocks))));

                return wasItFoundInSelectedTransactions || wasItFoundInBlocks;
            }, transaction.data.inputs);

            if (R.all(R.equals(false), transactionInputFoundAnywhere)) {
                // 检查是否为合法的交易类型
                if ((transaction.type === 'regular' || 
                     transaction.type === 'register' || 
                     transaction.type === 'course' || 
                     transaction.type === 'attendance' || 
                     transaction.type === 'Ids'||
                     transaction.type === 'lesson' ||
                     transaction.type === 'enroll' ||
                     transaction.type === 'regular' ||
                     transaction.type === 'reward' ||
                     transaction.type === 'fee'
                    ) &&     
                    negativeOutputsFound === 0) {
                    selectedTransactions.push(transaction);
                } else if (transaction.type === 'reward') {
                    selectedTransactions.push(transaction);
                } else if (negativeOutputsFound > 0) {
                    rejectedTransactions.push(transaction);
                }
            } else {
                rejectedTransactions.push(transaction);
            }
        }, candidateTransactions);

        console.info(`Selected ${selectedTransactions.length} candidate transactions with ${rejectedTransactions.length} being rejected.`);

        // console.log('已选择交易:', selectedTransactions.map(tx => ({
        //     id: tx.id,
        //     type: tx.type,
        //     metadata: tx.metadata
        // })));

        // Get the first two avaliable transactions, if there aren't TRANSACTIONS_PER_BLOCK, it's empty
        let transactions = R.defaultTo([], R.take(Config.TRANSACTIONS_PER_BLOCK, selectedTransactions));

        // Add fee transaction (1 satoshi per transaction)        
        if (transactions.length > 0) {
            let feeTransaction = Transaction.fromJson({
                id: CryptoUtil.randomId(64),
                hash: null,
                type: 'fee',
                data: {
                    inputs: [],
                    outputs: [
                        {
                            amount: Config.FEE_PER_TRANSACTION * transactions.length, // satoshis format
                            address: feeAddress, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's a simple destination address 
                        }
                    ]
                }
            });

            transactions.push(feeTransaction);
        }

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
                            amount: Config.MINING_REWARD, // satoshis format
                            address: rewardAddress, // INFO: Usually here is a locking script (to check who and when this transaction output can be used), in this case it's a simple destination address 
                        }
                    ]
                }
            });

            transactions.push(rewardTransaction);
        }

        return Block.fromJson({
            index,
            nonce: 0,
            currentDifficulty,
            previousHash,
            timestamp,
            transactions
        });
    }

    /* istanbul ignore next */
    static proveWorkFor(jsonBlock, difficulty) {
        let blockDifficulty = null;
        let start = process.hrtime();
        let block = Block.fromJson(jsonBlock);

        // INFO: Every cryptocurrency has a different way to prove work, this is a simple hash sequence

        // Loop incrementing the nonce to find the hash at desired difficulty
        do {
            block.timestamp = new Date().getTime() / 1000;
            block.nonce++;
            block.hash = block.toHash();
            blockDifficulty = block.getDifficulty();
        } while (blockDifficulty >= difficulty);
        console.info(`Block found: time '${process.hrtime(start)[0]} sec' dif '${difficulty}' hash '${block.hash}' nonce '${block.nonce}'`);
        return block;
    }
}

module.exports = Miner;
