// Do not change these configurations after the blockchain is initialized
module.exports = {
    // INFO: The mining reward could decreases over time like bitcoin. See https://en.bitcoin.it/wiki/Mining#Reward.
    MINING_REWARD: 5000000000,
    // INFO: Usually it's a fee over transaction size (not quantity)
    FEE_PER_TRANSACTION: 0,
    // INFO: Usually the limit is determined by block size (not quantity)
    TRANSACTIONS_PER_BLOCK: 2,
    genesisBlock: {
        index: 0,
        previousHash: '0',
        timestamp: Date.now()/1000,
        nonce: 0,
        currentDifficulty: 100000000000,
        transactions: [
            {
                id: '63ec3ac02f822450039df13ddf7c3c0f19bab4acd4dc928c62fcd78d5ebc6dba',
                hash: null,
                type: 'regular',
                data: {
                    inputs: [],
                    outputs: []
                }
            }
        ]
    },
    pow: {
        getDifficulty: (blocks, index) => {
            // 基础难度值
            const BASE_DIFFICULTY = 1000000000000;
            // 每N个区块调整一次难度
            const DIFFICULTY_ADJUSTMENT_INTERVAL = 5;
            // 目标出块时间(秒)
            const TARGET_BLOCK_TIME = 5;
            // 难度调整的最大比例
            const MAX_ADJUSTMENT_RATIO = 2;

            // 如果区块数量少于调整间隔,返回基础难度
            if (blocks.length < DIFFICULTY_ADJUSTMENT_INTERVAL) {
                console.info(`区块数量(${blocks.length})小于调整间隔(${DIFFICULTY_ADJUSTMENT_INTERVAL}), 返回基础难度: ${BASE_DIFFICULTY}`);
                return BASE_DIFFICULTY;
            }

            // 只在区块数是DIFFICULTY_ADJUSTMENT_INTERVAL的倍数时调整难度
            if (blocks.length % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0) {
                const currentDifficulty = blocks[blocks.length - 1].currentDifficulty;
                console.info(`当前区块(${blocks.length})不需要调整难度, 保持当前难度: ${currentDifficulty}`);
                return currentDifficulty;  // 返回前一个区块的难度
            }

            // 获取最近N个区块
            const lastBlock = blocks[blocks.length - 1];
            
            const lastAdjustmentBlock = blocks[blocks.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
            
            // 计算实际花费时间
            const timeExpected = TARGET_BLOCK_TIME * DIFFICULTY_ADJUSTMENT_INTERVAL;
            const timeActual = lastBlock.timestamp - lastAdjustmentBlock.timestamp;

            console.info(`开始第${blocks.length}个区块的难度调整:`);
            console.info(`预期时间: ${timeExpected}秒, 实际时间: ${timeActual}秒`);
            console.info(`当前难度: ${lastBlock.currentDifficulty}`);

            // 根据时间差调整难度
            let newDifficulty = lastBlock.currentDifficulty;
            
            if (timeActual < timeExpected / MAX_ADJUSTMENT_RATIO) {
                // 如果时间太短,提高难度
                newDifficulty = lastBlock.currentDifficulty / MAX_ADJUSTMENT_RATIO;
                console.info(`时间太短，提高难度至: ${newDifficulty}`);
            } else if (timeActual > timeExpected * MAX_ADJUSTMENT_RATIO) {
                // 如果时间太长,降低难度
                newDifficulty = lastBlock.currentDifficulty * MAX_ADJUSTMENT_RATIO;
                console.info(`时间太长，降低难度至: ${newDifficulty}`);
            } else {
                // 正常调整
                newDifficulty = lastBlock.currentDifficulty * (timeActual / timeExpected);
                console.info(`正常调整难度至: ${newDifficulty}`);
            }

            const finalDifficulty = Math.max(Math.floor(newDifficulty), 1);
            console.info(`最终难度值: ${finalDifficulty}`);
            console.info('------------------------');
            
            return finalDifficulty;
        }
    }
};