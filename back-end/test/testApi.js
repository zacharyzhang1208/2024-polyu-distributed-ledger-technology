const supertest = require('supertest');
const HttpServer = require('../lib/httpServer/index.js');
const Blockchain = require('../lib/blockchain/index.js');
const Operator = require('../lib/operator/index.js');
const Miner = require('../lib/miner/index.js');
const Node = require('../lib/node/index.js');
const fs = require('fs-extra');

const logLevel = 0;
require('../lib/util/consoleWrapper.js')('testApi', logLevel);

const walletPassword = 't t t t t';
let context = {};

const createNaivecoin = (name, host, port, peers, removeData = true) => {
    if (removeData) fs.removeSync('data/' + name + '/');
    let blockchain = new Blockchain(name);
    let operator = new Operator(name, blockchain);
    let miner = new Miner(blockchain, logLevel);
    let node = new Node(host, port, peers, blockchain);
    let httpServer = new HttpServer(node, blockchain, operator, miner);
    return httpServer.listen(host, port);
};

(async () => {
    // Start server
    context.httpServer1 = await createNaivecoin('testNode', 'localhost', 3003, []);

    // Create wallet
    let res = await supertest(context.httpServer1.app)
        .post('/operator/wallets')
        .send({ password: walletPassword })
        .expect(201);
    context.walletId = res.body.id;
    console.log('Wallet created:', context.walletId);

    // Create address
    res = await supertest(context.httpServer1.app)
        .post(`/operator/wallets/${context.walletId}/addresses`)
        .set({ password: walletPassword })
        .expect(201);
    context.address1 = res.body.address;
    console.log('Address created:', context.address1);

    // Mine an empty block
    await supertest(context.httpServer1.app)
        .post('/miner/mine')
        .send({ rewardAddress: context.address1 })
        .expect(201);
    console.log('Empty block mined');

    // Create a transaction
    res = await supertest(context.httpServer1.app)
        .post(`/operator/wallets/${context.walletId}/transactions`)
        .set({ password: walletPassword })
        .send({
            fromAddress: context.address1,
            toAddress: context.address1, // Use the same address for simplicity
            amount: 1000000000,
            changeAddress: context.address1
        })
        .expect(201);
    context.transactionId = res.body.id;
    console.log('Transaction created:', context.transactionId);

    // Mine a block with transactions
    await supertest(context.httpServer1.app)
        .post('/miner/mine')
        .send({ rewardAddress: context.address1 })
        .expect(201);
    console.log('Block with transaction mined');

    console.log('All tests completed successfully!');
})();