const axios = require('axios');
const Config = require('../lib/config');

// 添加区块挖矿时间记录数组
let miningTimes = [];

async function testMiningDifficulty() {
    console.log('开始持续挖矿测试...\n');
    
    const faucetAddress = Config.FAUCET_ADDRESS;
    let blockCount = 0;
    let lastBlockTime = Date.now();
    let i = 0;
    let totalTime = 0;
    // 持续挖矿
    while (true) {
        console.log(`\n开始挖掘第 ${blockCount + 1} 个区块...`);
        
        const startTime = Date.now();
        const blockInterval = (startTime - lastBlockTime) / 1000; // 区块间隔时间(秒)
        
        if (blockCount > 0) {
            console.log('距离上一个区块的时间:', blockInterval.toFixed(2), '秒');
        }
        
        try {
            // 调用挖矿接口
            const response = await axios.post('http://localhost:3001/miner/mine', {
                rewardAddress: faucetAddress,
                feeAddress: faucetAddress
            });

            const newBlock = response.data;
            const endTime = Date.now();
            const miningTime = (endTime - startTime) / 1000; // 挖矿时间(秒)
            
        
            // 每五个块输出一次五个块的时间和
            i++;
            totalTime += miningTime;
            if (i % 5 === 0) {
                console.log(`最近 5 个区块的总挖矿耗时: ${totalTime.toFixed(2)} 秒`);
                console.log(`平均每个区块挖矿耗时: ${(totalTime / 5).toFixed(2)} 秒`);
                totalTime = 0;
            }

            // // 如果累积了足够的区块数据，计算并显示总时间
            // if (blockCount > 0 && blockCount % DIFFICULTY_ADJUSTMENT_INTERVAL === 0) {
            //     const totalTime = miningTimes.reduce((sum, time) => sum + time, 0);
            //     console.log('\n----------------------------------------');
            //     console.log(`最近 ${DIFFICULTY_ADJUSTMENT_INTERVAL} 个区块的总挖矿耗时: ${totalTime.toFixed(2)} 秒`);
            //     console.log(`平均每个区块挖矿耗时: ${(totalTime / DIFFICULTY_ADJUSTMENT_INTERVAL).toFixed(2)} 秒`);
            //     console.log('----------------------------------------\n');
            // }
            
            // 输出详细信息
            console.log('----------------------------------------');
            console.log('区块信息:');
            console.log('哈希值:', newBlock.hash);
            console.log('挖矿耗时:', miningTime.toFixed(2), '秒');
            console.log('区块高度:', newBlock.index);
            console.log('交易数量:', newBlock.transactions.length);
            console.log('生成时间:', new Date().toLocaleString());
            
            // 获取当前难度
            const difficultyResponse = await axios.get('http://localhost:3001/blockchain/blocks/latest');
            const currentDifficulty = difficultyResponse.data.currentDifficulty || difficultyResponse.data.header.currentDifficulty;
            console.log('当前难度:', currentDifficulty);
            console.log('----------------------------------------');
            
            // 更新计数器和时间
            blockCount++;
            lastBlockTime = endTime;
            
            // 短暂暂停，避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error('挖矿失败:', error.message);
            if (error.response) {
                console.error('错误响应:', error.response.data);
            }
            // 出错后等待一段时间再继续
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// 运行测试
console.log('开始无限挖矿测试...');
console.log('确保 HTTP 服务器已经启动在 localhost:3001');
console.log('按 Ctrl+C 停止测试\n');

testMiningDifficulty()
    .catch(error => {
        console.error('测试过程出错:', error);
        process.exit(1);
    });

// 优雅地处理退出
process.on('SIGINT', () => {
    console.log('\n\n停止挖矿...');
    console.log('测试结束');
    process.exit(0);
});
