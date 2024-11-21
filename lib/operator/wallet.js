const fs = require('fs');
const path = require('path');
const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil');
const CryptoEdDSAUtil = require('../util/cryptoEdDSAUtil');

class Wallet {
    constructor(localDbPath, blockchainPath){
        this.localDbPath = path.resolve(__dirname, '../localDb.json');// 本地数据库路径
        this.blockchainPath = path.resolve(__dirname, '../blockchain.json'); // 区块链文件路径
        this.id = null;
        this.passwordHash = null;
        this.secret = null;
        this.keyPairs = [];
    }

    // 从本地数据库查找私钥
    async findPrivateKey(publicKey) {
        try {
            if (!fs.existsSync(this.localDbPath)) {
                throw new Error(`Local database file not found at: ${this.localDbPath}`);
            }
    
            // 加载 localDb 文件，确保是数组格式
            const localDb = JSON.parse(fs.readFileSync(this.localDbPath, 'utf-8'));
            if (!Array.isArray(localDb)) {
                throw new Error('Invalid localDb format: Expected an array');
            }
    
            // 遍历所有钱包对象，查找对应的 publicKey
            let walletWithKeyPair = null;
            for (const wallet of localDb) {
                const keyPair = wallet.keyPairs.find(pair => pair.publicKey === publicKey);
                if (keyPair) {
                    walletWithKeyPair = {
                        id: wallet.id,
                        passwordHash: wallet.passwordHash,
                        secret: wallet.secret,
                        keyPair: keyPair
                    };
                    break;
                }
            }
    
            if (!walletWithKeyPair) {
                throw new Error(`No private key found for public key: ${publicKey}`);
            }
    
            return walletWithKeyPair;
        } catch (error) {
            throw new Error(`Error finding private key: ${error.message}`);
        }
    }
    
    

    // 从区块链文件查找公钥相关交易
    async findPublicKey(publicKey) {
        try {
            if (!fs.existsSync(this.blockchainPath)) {
                throw new Error(`Blockchain file not found at: ${this.blockchainPath}`);
            }
    
            const blockchainData = JSON.parse(fs.readFileSync(this.blockchainPath, 'utf-8'));
    
            const relatedData = {
                inputs: [],
                outputs: []
            };
    
            blockchainData.forEach(block => {
                if (block.transactions && Array.isArray(block.transactions)) {
                    block.transactions.forEach(transaction => {
                        if (transaction.data.inputs && Array.isArray(transaction.data.inputs)) {
                            transaction.data.inputs.forEach(input => {
                                if (input.address === publicKey) {
                                    relatedData.inputs.push({
                                        blockIndex: block.index,
                                        transactionId: transaction.id,
                                        ...input
                                    });
                                }
                            });
                        }
    
                        if (transaction.data.outputs && Array.isArray(transaction.data.outputs)) {
                            transaction.data.outputs.forEach(output => {
                                if (output.address === publicKey) {
                                    relatedData.outputs.push({
                                        blockIndex: block.index,
                                        transactionId: transaction.id,
                                        ...output
                                    });
                                }
                            });
                        }
                    });
                }
            });
    
            return relatedData;
        } catch (error) {
            throw new Error(`Error finding data by public key: ${error.message}`);
        }
    }
    // 存储结果到本地数据库
   /* saveToLocalDatabase(publicKey, relatedData) {
        try {
            let localDb = { keyPairs: [], transactions: [] };

            // 如果本地数据库存在，加载数据
            if (fs.existsSync(this.localDbPath)) {
                localDb = JSON.parse(fs.readFileSync(this.localDbPath, 'utf-8'));
            }

            // 保存交易记录到本地数据库
            localDb.transactions.push({
                publicKey: publicKey,
                data: relatedData
            });

            fs.writeFileSync(this.localDbPath, JSON.stringify(localDb, null, 2), 'utf-8');
            console.log(`Data saved to local database at: ${this.localDbPath}`);
        } catch (error) {
            throw new Error(`Error saving data to local database: ${error.message}`);
        }
    }*/

    generateAddress() {
        if (this.secret == null) {
            this.generateSecret();
        }

        let lastKeyPair = R.last(this.keyPairs);

        let seed = (lastKeyPair == null ? this.secret : CryptoEdDSAUtil.generateSecret(R.propOr(null, 'secretKey', lastKeyPair)));
        let keyPairRaw = CryptoEdDSAUtil.generateKeyPairFromSecret(seed);
        let newKeyPair = {
            index: this.keyPairs.length + 1,
            secretKey: CryptoEdDSAUtil.toHex(keyPairRaw.getSecret()),
            publicKey: CryptoEdDSAUtil.toHex(keyPairRaw.getPublic())
        };
        this.keyPairs.push(newKeyPair);
        return newKeyPair.publicKey;
    }

    generateSecret() {
        this.secret = CryptoEdDSAUtil.generateSecret(this.passwordHash);
        return this.secret;
    }

    getAddressByIndex(index) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('index', index), this.keyPairs));
    }

    getAddressByPublicKey(publicKey) {
        return R.propOr(null, 'publicKey', R.find(R.propEq('publicKey', publicKey), this.keyPairs));
    }

    getSecretKeyByAddress(address) {
        return R.propOr(null, 'secretKey', R.find(R.propEq('publicKey', address), this.keyPairs));
    }

    getAddresses() {
        return R.map(R.prop('publicKey'), this.keyPairs);
    }

    static fromPassword(password) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.passwordHash = CryptoUtil.hash(password);
        return wallet;
    }

    static fromHash(passwordHash) {
        let wallet = new Wallet();
        wallet.id = CryptoUtil.randomId();
        wallet.passwordHash = passwordHash;
        return wallet;
    }

    static fromJson(data) {
        let wallet = new Wallet();
        R.forEachObjIndexed((value, key) => { wallet[key] = value; }, data);
        return wallet;
    }
}

module.exports = Wallet;
