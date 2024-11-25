// Do not change these configurations after the blockchain is initialized
module.exports = {
    // INFO: The mining reward could decreases over time like bitcoin. See https://en.bitcoin.it/wiki/Mining#Reward.
    MINING_REWARD: 1,
    // INFO: Usually it's a fee over transaction size (not quantity)
    FEE_PER_TRANSACTION: 0,
    FAUCET_WALLET_ID: "bae2d59ebaf1e5d40443662ae3730b65418477ee5f80471a0b3a4d513409ec34",
    FAUCET_ADDRESS: "e368822ca3c0f4c2b9e89bf4c206fe17f2028e7faec8f40d8c552896237a624e",
    FAUCET_SECRET_KEY:"0bdc7ff7e4f71ce377e3217feda8b74ae520488342d860e2a27cb6e50fc168458d0be7958e8327bb0d1ef763e2627a175846045daf97b7ca2a991a16e8dab443d8ad05ccefd5114d7c7315fb8645d02d7d248b1585dfd16e51d47f42d2df4581881e87d8d02cb50e455d3051df925377381fb4b4bb5ea5e2c9f6403c69a2d470ff9f42c015a52e549da2e6cf959c958941279345c3b973541fc5591e45a25fd2b631ff87e26152e2a7860dd563d0b618e4bb9cfd879d6521d79bcb4b401fb56b01d913a620240bdebe88c74b1614c641512e06aaf3d7b3072f1c1a075ed3b86631393b8d9f39d09a73f853516a9ad49b16baead50d16a4213d93cdeb77638ea906d643043517f2e17fe9371ccc8ec64fec02525f3eb3eeefd3e70e5d2c2d83758764e1c05c7ea7e8d18abb070139eddbc395f6d6afbcf4e125b31bbec3bdbbd70d2249d1532bfb8a743da84f0afa3079f909980eef27cbc527415f38b14c6cdb7c5238e2fa0e2a41251e6a0f07b136f1f3d2cd51b4aba8d156ad41e7f27e3898bbcc0eeac103fd5ec1c2dee4a9b3c4596de78aebd070bbdfa9ec7a3fabaf58d3ee579e244145998dcf83dab0116d1f7415578c778b189cd1e771148971ce350fe49fb81b178ee38e1a0bde53118082d67759d1ba6ddf9ff562ca6fa1e3c8515a2a141b9c7a4951dd738fb8314aa9ca4baf0af4418545beb440c65e48278c7019",

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
                    outputs: [
                        {
                            amount: 500000, // 给 faucet 地址 50 万
                            address: 'e368822ca3c0f4c2b9e89bf4c206fe17f2028e7faec8f40d8c552896237a624e' // faucet 地址
                        }
                    ],
                    metadata: {
                        category: 'genesis',
                    },
                    List: [  // 添加 ID 列表
                        '20240001g', 
                        '20240002g', 
                        '20240003g',
                        '20240004g',
                        '20240005g',
                        '20240006g',
                        '20240007g',
                        '20240008g',
                        '202410000t',
                        '240242000t'
                    ]
                }
            }
        ]
    },
    pow: {
        getDifficulty: (blocks, index) => {
            // 基础难度值
            const BASE_DIFFICULTY = 10000000000000;//加了两个0
            // 每N个区块调整一次难度
            const DIFFICULTY_ADJUSTMENT_INTERVAL = 5;
            // 目标出块时间(秒)
            const TARGET_BLOCK_TIME = 5;
            // 难度调整的最大比例
            const MAX_ADJUSTMENT_RATIO = 4;

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