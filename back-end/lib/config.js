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
        timestamp: Date.now() / 1000,
        nonce: 0,
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
                        '123456a', 
                        '123456b', 
                        '123456c',
                        '123456d',
                        '123456e',
                        '123456f',
                        '123456g',
                        '123456h',
                        '456789t',
                        '1232456t'
                    ]
                }
            }
        ]
    },
    pow: {
        getDifficulty: (blocks, index) => {
            // Proof-of-work difficulty settings
            const BASE_DIFFICULTY = Number.MAX_SAFE_INTEGER;
            const EVERY_X_BLOCKS = 5;
            const POW_CURVE = 5;

            // INFO: The difficulty is the formula that naivecoin choose to check the proof a work, this number is later converted to base 16 to represent the minimal initial hash expected value.
            // INFO: This could be a formula based on time. Eg.: Check how long it took to mine X blocks over a period of time and then decrease/increase the difficulty based on that. See https://en.bitcoin.it/wiki/Difficulty
            return Math.max(
                Math.floor(
                    BASE_DIFFICULTY / Math.pow(
                        Math.floor(((index || blocks.length) + 1) / EVERY_X_BLOCKS) + 1
                        , POW_CURVE)
                )
                , 0);
        }

    }
};