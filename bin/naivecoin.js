#!/usr/bin/env node
const naivecoin = require('./../lib/naivecoin');
const wallet = require('../lib/operator/wallet');

const fs = require('fs');

const argv = require('yargs')
.usage('Usage: $0 [options]')
.alias('a', 'host')
.describe('a', 'Host address. (localhost by default)')
.alias('p', 'port')
.describe('p', 'HTTP port. (3001 by default)')
.alias('l', 'log-level')
.describe('l', 'Log level (7=dir, debug, time and trace; 6=log and info; 4=warn; 3=error, assert; 6 by default).')
.describe('peers', 'Peers list.')
.describe('name', 'Node name/identifier.')
.array('peers')
.help('h')
.alias('h', 'help')
.argv;

// 如果提供了 publicKey 和 localDbPath，执行钱包查询功能
if (argv.publicKey && argv.localDbPath) {
    console.log(`Using local database: ${argv.localDbPath}`);
    console.log(`Querying data for publicKey: ${argv.publicKey}`);

    const walletInstance = new wallet(argv.localDbPath, argv.blockchainPath);

    walletInstance.findPrivateKey(argv.publicKey)
        .then(privateKey => {
            console.log('Private Key Data:', privateKey);
            return walletInstance.findPublicKey(argv.publicKey);
        })
        .then(publicKeyData => {
            console.log('Public Key Data:', publicKeyData);
        })
        .catch(err => {
            console.error('Error:', err.message);
        });
} else {
    naivecoin(argv.host, argv.port, argv.peers, argv.logLevel, argv.name);
}

